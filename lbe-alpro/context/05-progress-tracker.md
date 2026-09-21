Current phase

G1 Foundation + Auth — COMPLETE.

Current goal

G1 done. Ready for G2 (registration flow).

In progress
BE-11 (organizer event CRUD)

Completed
K-00 baseline, K-01 repo scaffold, K-02 ERD/enums, K-03 contract v1, K-04 CORS, K-05 runbook,
BE-01 bootstrap, BE-02 models, BE-03 response envelope, BE-04+BE-05 auth+middleware,
BE-06 seed, BE-07 events read, BE-08 Swagger + Bruno

Coming next

Phase A — Backend foundation (PRD week 1) 01 repo-scaffold [M] → 02 backend-bootstrap [M] → 03 db-models [M] → 04 auth-api [M] → 05 rbac-middleware [M]

Phase B — Core events (PRD week 2) 06 events-read-api [M] → 07 events-write-api [M] → 08 registration-api [M] → 09 frontend-bootstrap + design-system [M] → 10 auth-pages [M] → 11 explore-page [M] → 12 event-detail-register [M]

Phase C — Organizer & admin (PRD week 3) 13 registrants-api [M] → 14 admin-moderation-api [M] → 15 organizer-dashboard-ui [M] → 16 admin-moderation-ui [M] → 17 teams-api [S] → 18 teams-ui [S] → 19 profile-api-ui [S] → 20 swagger-audit [M] → 21 bruno-collection-audit [M]

Phase D — Polish (PRD week 4) 22 csv-export [N] → 23 notifications [N] → 24 e2e-test-and-bugfix [M] → 25 readme-and-repo-cleanup [M]

Units 20 and 21 are audits only: Swagger annotations and Bruno requests are written inside each API unit (see workflow rule 7), so these just verify 100% endpoint coverage.

Architectural decisions

Pre-decided from PRD.md:

Monorepo: frontend/ (Next.js), backend/ (Go + Gin + GORM), bruno/ (API collection), context/.
Backend layering: cmd/server/main.go, internal/{config,handler,service,repository,model,middleware}, docs/ (swaggo).
Single events table with category + type columns; no per-bidang tables.
Auth: bcrypt password hashes, JWT bearer tokens, roles student | organizer | admin.
API prefix /api/v1; success envelope {success, message, data}; error envelope {success:false, error:{code, message}}; pagination via page + limit.
Registration: unique composite index (event_id, user_id); quota + deadline checked in the service inside a DB transaction (prevents overbooking).
Indexes on events.category, events.type, events.status.
Swagger UI at /swagger/index.html.

Append one line per completed unit, e.g. F03: GORM models User/Event/Registration/Team in internal/model, AutoMigrate in internal/config/database.go.

## K-02 — ERD and enum freeze (frozen)

### Tables

**users**
| Column | Type | Constraints |
|---|---|---|
| id | uint PK | auto-increment |
| name | varchar(255) | NOT NULL |
| email | varchar(255) | NOT NULL, UNIQUE |
| password_hash | varchar(255) | NOT NULL |
| role | varchar(20) | NOT NULL, DEFAULT 'student' |
| department | varchar(100) | nullable |
| bio | text | nullable |
| created_at | timestamptz | NOT NULL |
| updated_at | timestamptz | NOT NULL |

**events**
| Column | Type | Constraints |
|---|---|---|
| id | uint PK | auto-increment |
| organizer_id | uint FK→users.id | NOT NULL, INDEX |
| title | varchar(255) | NOT NULL |
| category | varchar(50) | NOT NULL |
| type | varchar(50) | NOT NULL |
| description | text | NOT NULL |
| poster_url | varchar(500) | nullable |
| quota | integer | NOT NULL, CHECK > 0 |
| current_participants | integer | NOT NULL, DEFAULT 0 |
| deadline | timestamptz | NOT NULL |
| start_date | timestamptz | nullable |
| end_date | timestamptz | nullable |
| status | varchar(20) | NOT NULL, DEFAULT 'pending' |
| created_at | timestamptz | NOT NULL |
| updated_at | timestamptz | NOT NULL |

Indexes: INDEX(category), INDEX(type), INDEX(status), INDEX(organizer_id).

**registrations**
| Column | Type | Constraints |
|---|---|---|
| id | uint PK | auto-increment |
| event_id | uint FK→events.id | NOT NULL |
| user_id | uint FK→users.id | NOT NULL |
| answer | text | nullable |
| attachment_url | varchar(500) | nullable |
| status | varchar(20) | NOT NULL, DEFAULT 'pending' |
| registered_at | timestamptz | NOT NULL |

UNIQUE composite index: (event_id, user_id).

**teams**
| Column | Type | Constraints |
|---|---|---|
| id | uint PK | auto-increment |
| event_id | uint FK→events.id | NOT NULL |
| creator_id | uint FK→users.id | NOT NULL |
| title | varchar(255) | NOT NULL |
| description | text | nullable |
| contact_info | varchar(255) | NOT NULL |
| max_members | integer | nullable, CHECK > 0 if set |
| created_at | timestamptz | NOT NULL |

**team_members**
| Column | Type | Constraints |
|---|---|---|
| id | uint PK | auto-increment |
| team_id | uint FK→teams.id | NOT NULL, ON DELETE CASCADE |
| user_id | uint FK→users.id | NOT NULL |
| joined_at | timestamptz | NOT NULL |

UNIQUE composite index: (team_id, user_id).

### Enums (frozen)

Storage: varchar + Go typed constants + DTO validation. No PostgreSQL native enums.

**roles**: student, organizer, admin
**categories**: minat_bakat, kewirausahaan, manajerial, keilmiahan
**types**: lomba, bootcamp, oprec, workshop, funmatch, bazar, riset
**event statuses**: pending, published, rejected
**registration statuses**: pending, approved, rejected

Display labels (Indonesian, UI-only):
- roles: Mahasiswa, Penyelenggara, Admin
- categories: Minat Bakat, Kewirausahaan, Manajerial, Keilmiahan
- types: Lomba, Bootcamp, Oprec, Workshop, Funmatch, Bazar, Riset
- event statuses: Menunggu, Dipublikasikan, Ditolak
- registration statuses: Menunggu, Diterima, Ditolak

## K-03 — Contract v1 (frozen)

### Base prefix
`/api/v1`

### All routes (frozen)

| Method | Path | Auth | Role |
|---|---|---|---|
| POST | /auth/register | Public | — |
| POST | /auth/login | Public | — |
| GET | /users/me | Bearer | any |
| PUT | /users/me | Bearer | any |
| GET | /events | Public | — |
| GET | /events/:id | Public | — |
| POST | /events | Bearer | organizer, admin |
| PUT | /events/:id | Bearer | owner organizer / admin |
| DELETE | /events/:id | Bearer | owner organizer / admin |
| GET | /organizer/events | Bearer | organizer, admin |
| POST | /events/:id/register | Bearer | student |
| GET | /registrations/me | Bearer | any |
| GET | /events/:id/registrants | Bearer | owner organizer / admin |
| PUT | /registrations/:id/status | Bearer | owner organizer / admin |
| GET | /teams | Public | — |
| POST | /teams | Bearer | student |
| POST | /teams/:id/join | Bearer | student |
| GET | /admin/events | Bearer | admin |
| PUT | /admin/events/:id/status | Bearer | admin |
| GET | /admin/users | Bearer | admin |
| PUT | /admin/users/:id/role | Bearer | admin |

### Envelopes (frozen)

Success:
```json
{ "success": true, "message": "Berhasil ...", "data": {} }
```

List success:
```json
{ "success": true, "message": "...", "data": [], "meta": { "page": 1, "limit": 10, "total": 42 } }
```

Error:
```json
{ "success": false, "error": { "code": "ERROR_CODE", "message": "..." } }
```

### Pagination defaults (frozen)
- page: default 1
- limit: default 10, max 50

### HTTP status codes (frozen)
- 200: read/update success
- 201: create success
- 204: delete (no body)
- 400: validation error
- 401: missing/invalid/expired token
- 403: wrong role / not owner
- 404: resource not found
- 409: conflict (duplicate)
- 422: business rule violation
- 500: unexpected error

### Standard error codes (frozen)
- VALIDATION_ERROR (400)
- UNAUTHORIZED (401)
- FORBIDDEN (403)
- NOT_FOUND (404)
- EMAIL_TAKEN (409)
- ALREADY_REGISTERED (409)
- EVENT_QUOTA_FULL (422)
- EVENT_DEADLINE_PASSED (422)
- EVENT_NOT_PUBLISHED (422)
- INTERNAL_ERROR (500)

### Query params for GET /events (frozen)
- category: string (optional)
- type: string (optional)
- status: "open" | "closed" (optional, derived: open = deadline >= now AND current_participants < quota)
- q: string (optional, keyword search on title/description)
- page: int (default 1)
- limit: int (default 10, max 50)

### Quota accounting decision (frozen)
- Register: increment current_participants.
- Reject (pending→rejected): decrement current_participants.
- Approve (pending→approved): no change to current_participants.

## K-04 — Runtime/CORS (frozen)

- PORT=8080
- CORS_ORIGIN=http://localhost:3000
- Authentication: Bearer JWT header
- CORS middleware implemented: allow origin from env, methods GET/POST/PUT/DELETE/OPTIONS, headers Authorization/Content-Type, OPTIONS preflight returns 204.
- No JWT middleware yet (arrives BE-05).

## K-05 — Local PostgreSQL runbook

### Prerequisites
- Go 1.26+ installed
- PostgreSQL 14+ installed and running
- psql available in PATH

### Steps

1. **Create database:**
   ```bash
   createdb -U postgres sinergiits
   ```
   Or via psql:
   ```sql
   CREATE DATABASE sinergiits;
   ```

2. **Create .env:**
   ```bash
   cp .env.example .env
   ```
   Edit .env and set DB_PASSWORD to your local PostgreSQL password.

3. **Start backend:**
   ```bash
   cd lbe-alpro/backend
   go run ./cmd/server
   ```
   Server starts on :8080. AutoMigrate creates tables on startup (BE-01).

4. **Verify connection:**
   ```bash
   curl http://localhost:8080/health
   # {"success":true,"message":"OK","data":{"status":"up"}}
   ```

5. **Start frontend (after FE-01):**
   ```bash
   cd lbe-alpro/frontend
   npm run dev
   ```
   Frontend starts on :3000, connects to backend via NEXT_PUBLIC_API_URL.

### Seed accounts (BE-06)
| Email | Password | Role |
|---|---|---|
| admin@sinergiits ITS.ac.id | admin123 | admin |
| organizer@sinergiits ITS.ac.id | org123 | organizer |
| student@sinergiits ITS.ac.id | stu123 | student |

Open decisions / PRD gaps

Resolve each in the relevant spec (and amend PRD.md) before that unit is implemented. Proposed answers are suggestions, not decisions.

 DECIDED (K-02): UC-05 — team_members table + POST /teams/{id}/join included.
 DECIDED (K-02): UC-09/10 — admin endpoints included in contract v1.
 DECIDED (K-02): Organizer promotion — register always creates student; admin promotes via PUT /admin/users/:id/role.
 DECIDED (K-02): Registration answers — nullable answer (TEXT) + attachment_url (VARCHAR) included.
 DECIDED (K-02): Event dates — start_date, end_date included (nullable).
 DECIDED (K-03): Quota accounting — increment on register, decrement on reject.
 OPEN: Event DELETE — hard delete by owner/admin (included in contract). Decide at BE-11d.
 OPEN: Frontend token storage — localStorage proposed. Confirm at FE-10.
 DECIDED: Home route — / is Explore, no landing page (04-ui-context.md).
Session notes
- Go 1.26.1, Gin v1.12.0, GORM v1.31.2, golang-jwt/v5 v5.3.1
- swag init must be re-run after any annotation change
- CORS must allow frontend origin (http://localhost:3000)
- Gin JSON binding errors need mapping to standard error envelope
- Repo root: /Users/macbook/lbe-alpro (outer), nested lbe-alpro/ is canonical project root
- PRD.md exists at outer root only, not nested (document gap)
- Unrelated Ghost AI specs in context/feature-specs/ — untouched

## Completion log

BE-01: backend/go.mod (direct deps: gin, gorm, pgx, jwt), internal/config/config.go (Validate, ConnectDB), cmd/server/main.go (DB, AutoMigrate)
BE-02: internal/model/types.go (enums), user.go, event.go, registration.go, team.go
BE-03: internal/response/response.go (Success/Created/NoContent/Paginated/Error), errors.go (sentinel errors + HandleError)
BE-04: internal/dto/auth.go, internal/repository/user_repository.go, internal/service/auth_service.go, internal/handler/auth_handler.go
BE-05: internal/middleware/auth.go (AuthJWT, RequireRole)
BE-06: internal/config/seed.go (admin, 2 organizers, 2 students, 15 events across 4 bidang + pending/rejected/past-deadline)
BE-07: internal/repository/event_repository.go, internal/service/event_service.go, internal/handler/event_handler.go
BE-08: cmd/server/main.go (swagger route, swagger annotations), docs/ (generated), bruno/ (Auth + Events folders, environment)