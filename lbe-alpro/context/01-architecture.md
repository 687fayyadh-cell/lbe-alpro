# Architecture

## Stack

| Layer | Tech | Role |
|---|---|---|
| Frontend | Next.js (App Router) + TypeScript + Tailwind | Pages, layouts, forms, consumes REST API |
| Backend | Go + Gin | HTTP routing, handlers, middleware |
| ORM | GORM (`gorm.io/driver/postgres`) | Models, queries, transactions, AutoMigrate |
| DB | PostgreSQL | All app data |
| Auth | JWT (`golang-jwt/jwt`) + bcrypt | Stateless auth, role claims |
| API docs | swaggo/swag + gin-swagger | Swagger UI at `/swagger/index.html` |
| API testing | Bruno (or Postman) | Collection in `bruno/` |

```
Next.js  --REST/JSON-->  Go + Gin  --GORM-->  PostgreSQL
```

## Repository layout

```
sinergi-its/
├── frontend/          # Next.js
├── backend/           # Go + Gin + GORM
├── bruno/             # API collection
├── .gitignore
├── .env.example
└── README.md
```

### backend/

```
backend/
├── cmd/server/main.go       # entry point: load config, connect DB, migrate, wire, run
├── internal/
│   ├── config/              # env loading, DB connection
│   ├── model/               # GORM entities
│   ├── repository/          # DB access only (GORM)
│   ├── service/             # business logic, transactions
│   ├── handler/             # Gin handlers, DTOs, swagger annotations
│   ├── middleware/          # AuthJWT, RequireRole, CORS
│   ├── dto/                 # request/response structs + validation tags
│   └── response/            # standard success/error envelope helpers
├── docs/                    # swag-generated (do not hand-edit)
├── .env.example
└── go.mod
```

### frontend/

```
frontend/
├── app/
│   ├── (auth)/login, register
│   ├── (main)/page.tsx            # Explore events
│   ├── (main)/events/[id]
│   ├── (main)/teams
│   ├── (main)/my-registrations
│   ├── (main)/profile
│   ├── organizer/events           # dashboard, create, edit, registrants
│   └── admin/moderation           # pending events, users
├── components/                    # Navbar, EventCard, FilterBar, Modal, DataTable, ...
├── lib/                           # api client, auth helpers, types
└── hooks/                         # useAuth, useEvents, ...
```

## System boundaries

- **Handler**: bind + validate request → call service → map to response envelope. No business logic, no direct GORM calls.
- **Service**: business rules (status, quota, deadline, duplicate, ownership). Owns transactions. Returns typed domain errors.
- **Repository**: GORM queries only. No HTTP concepts, no rules.
- **Middleware**: `AuthJWT` parses Bearer token → puts `userID`, `role` in Gin context. `RequireRole(...)` gates route groups.
- **Frontend**: all data via `lib/api` (one place for base URL, token header, error parsing). Base URL from `NEXT_PUBLIC_API_URL`.

## Data model (PostgreSQL)

| Entity | Key fields |
|---|---|
| `users` | id PK, name, email UNIQUE, password_hash, role (`student\|organizer\|admin`, default `student`), department, bio?, created_at, updated_at |
| `events` | id PK, organizer_id FK→users, title, category, type, description, poster_url, quota, current_participants (default 0), deadline, start_date, end_date, status (`pending\|published\|rejected`, default `pending`), created_at, updated_at |
| `registrations` | id PK, event_id FK→events, user_id FK→users, answer/attachment_url?, status (`pending\|approved\|rejected`, default `pending`), registered_at. **UNIQUE (event_id, user_id)** |
| `teams` | id PK, event_id FK→events, creator_id FK→users, title, description, contact_info, max_members?, created_at |
| `team_members` | id PK, team_id FK→teams (cascade), user_id FK→users, joined_at. **UNIQUE (team_id, user_id)** |

- `category` values: `minat_bakat`, `kewirausahaan`, `manajerial`, `keilmiahan`.
- `type` values: `lomba`, `bootcamp`, `oprec`, `workshop`, `funmatch`, `bazar`, `riset`.
- Store enums as `varchar` with CHECK constraint or Go typed constants validated in DTO (do not rely on Postgres native ENUM with AutoMigrate).
- Indexes: `events(category)`, `events(type)`, `events(status)`, `events(organizer_id)`, unique composite ones above.
- Relations: User 1–N Event (organizes), User 1–N Registration, Event 1–N Registration, Event 1–N Team, Team 1–N TeamMember.

## API design

Base path `/api/v1`. JSON only.

| Method | Endpoint | Description | Auth / Role |
|---|---|---|---|
| POST | `/auth/register` | Create account (role forced to `student`) | Public |
| POST | `/auth/login` | Login → JWT | Public |
| GET | `/users/me` | Current profile | Any authed |
| PUT | `/users/me` | Update profile | Any authed |
| GET | `/events` | List `published` events (filter + pagination) | Public |
| GET | `/events/:id` | Event detail | Public |
| POST | `/events` | Create event (status `pending`) | organizer, admin |
| PUT | `/events/:id` | Update event | Owner organizer / admin |
| DELETE | `/events/:id` | Delete event | Owner organizer / admin |
| GET | `/organizer/events` | My events (any status) | organizer, admin |
| POST | `/events/:id/register` | Register to event | student |
| GET | `/registrations/me` | My registrations | Any authed |
| GET | `/events/:id/registrants` | List registrants | Owner organizer / admin |
| PUT | `/registrations/:id/status` | Approve/reject registrant | Owner organizer / admin |
| GET | `/teams` | List team posts (filter `event_id`) | Public |
| POST | `/teams` | Create team post | student |
| POST | `/teams/:id/join` | Join team | student |
| GET | `/admin/events?status=pending` | Moderation queue | admin |
| PUT | `/admin/events/:id/status` | Approve (`published`) / reject | admin |
| GET | `/admin/users` | List users | admin |
| PUT | `/admin/users/:id/role` | Change role (e.g. grant `organizer`) | admin |

**Query params** for `GET /events`: `category`, `type`, `status` (open/closed by deadline), `q` (keyword on title/description), `page` (default 1), `limit` (default 10, max 50).

**Success envelope**
```json
{ "success": true, "message": "Berhasil mendaftar ke event", "data": { } }
```
List responses add `"meta": { "page": 1, "limit": 10, "total": 42 }`.

**Error envelope**
```json
{ "success": false, "error": { "code": "EVENT_QUOTA_FULL", "message": "Maaf, kuota pendaftaran untuk event ini sudah penuh." } }
```

Standard error codes: `VALIDATION_ERROR` (400), `UNAUTHORIZED` (401), `FORBIDDEN` (403), `NOT_FOUND` (404), `EMAIL_TAKEN` / `ALREADY_REGISTERED` / `EVENT_QUOTA_FULL` / `EVENT_DEADLINE_PASSED` / `EVENT_NOT_PUBLISHED` (409 or 422), `INTERNAL_ERROR` (500).

## Business rules (enforced in service layer)

1. **Register to event**, inside one `db.Transaction`:
   - event exists and `status = published`
   - `now() <= deadline`
   - `current_participants < quota` — lock the row (`clause.Locking{Strength: "UPDATE"}`) or use atomic `UPDATE ... WHERE current_participants < quota`
   - no existing `(event_id, user_id)` registration (DB unique index is the final guard)
   - insert registration, increment `current_participants`
2. **RBAC**: `/organizer/*` → organizer/admin; `/admin/*` → admin only. Ownership check (`event.organizer_id == userID`, or admin) for event update/delete, registrants, status update.
3. **Event creation**: status always forced to `pending` server-side, `organizer_id` taken from JWT never from body.
4. **Moderation**: only admin sets `published` / `rejected`. Public list returns only `published`.
5. **Registration status update**: only `pending → approved|rejected`. Rejecting a registration may decrement `current_participants` (decide once, document in Swagger).
6. **Register endpoint**: `role` in body is ignored; new users are always `student`. Admin grants `organizer`.
7. **Teams**: only join if not creator/member already and (if set) `max_members` not reached.

## Frontend routes

```
/login, /register
/                       Explore (FilterBar + EventCard grid + pagination)
/events/[id]            Detail + register modal
/my-registrations
/teams                  Cari Tim board (+ create/join)
/profile
/organizer/events       list, /new, /[id]/edit, /[id]/registrants
/admin/moderation       pending events, users
```

Route guard: unauthed → `/login`; wrong role → redirect/403 page. Navbar shows role-based links and Logout.

## Tool interaction rules

- Do not put business logic in handlers or repositories.
- Do not call GORM from handlers; go through service → repository.
- Do not trust client-provided `role`, `organizer_id`, `user_id`, `status`, or `current_participants`.
- Do not hand-edit `backend/docs/`; regenerate with `swag init -g cmd/server/main.go -o docs`.
- Do not hardcode API URL, DB credentials, or JWT secret; use env vars.
- Use `AutoMigrate` on startup for MVP; keep seed script separate and idempotent.

## Environment variables (`.env.example`)

```
# backend
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=
DB_NAME=sinergiits
JWT_SECRET=change-me
JWT_EXPIRES_HOURS=24
PORT=8080
CORS_ORIGIN=http://localhost:3000

# frontend
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

## Invariants (never break)

1. Layering: handler → service → repository → DB. No skipping.
2. Auth + role/ownership enforced server-side at every protected route (401 unauthenticated, 403 forbidden).
3. Registration is transactional; quota never exceeded, no duplicate `(event_id, user_id)`.
4. Only `published` events are visible in public endpoints.
5. Passwords stored as bcrypt hash only; never returned in any response.
6. All responses use the standard envelope and error codes.
7. Every endpoint has Swagger annotations and a Bruno request.
8. Database schema, API endpoints, and frontend pages stay consistent (types shared via `frontend/lib/types`).