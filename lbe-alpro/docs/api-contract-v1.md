# SinergiITS — API Contract v1 (FROZEN, G0)

Single reference for FE-02. Base path: `/api/v1`. JSON only.
Source specs: `PRD.md` §9–§10, `context/01-architecture.md`, `context/04-ui-context.md`.

## 1. Envelopes

Success (`200`, `201` create; `204` delete tanpa body):

```json
{ "success": true, "message": "Berhasil mendaftar ke event", "data": {} }
```

List responses add `meta`:

```json
{
  "success": true,
  "message": "Daftar event",
  "data": [],
  "meta": { "page": 1, "limit": 10, "total": 42 }
}
```

Error:

```json
{ "success": false, "error": { "code": "EVENT_QUOTA_FULL", "message": "Maaf, kuota pendaftaran untuk event ini sudah penuh." } }
```

## 2. Pagination & filtering

- `page` default `1`, `limit` default `10`, max `50`.
- `GET /events` filters: `category`, `type`, `status`, `q`, `page`, `limit`.
  - `category`: `minat_bakat | kewirausahaan | manajerial | keilmiahan`
  - `type`: `lomba | bootcamp | oprec | workshop | funmatch | bazar | riset`
  - `status`: `open | closed` — **derived, not stored**:
    `open` = `deadline >= now AND current_participants < quota`.
    UI labels: Dibuka / Ditutup / Kuota penuh.
  - `q`: keyword on title/description.
- Public event lists return only `status = published`.

## 3. Endpoints

| # | Method | Endpoint | Auth / Role | Body / Query | Response `data` |
|---|---|---|---|---|---|
| 1 | POST | `/auth/register` | Public | `{name, email, password, department?}` — `role` in body is ignored, always `student` | `{token, user}` (201) |
| 2 | POST | `/auth/login` | Public | `{email, password}` | `{token, user}` |
| 3 | GET | `/users/me` | Any authed | — | `User` |
| 4 | PUT | `/users/me` | Any authed | `{name?, department?, bio?}` | `User` |
| 5 | GET | `/events` | Public | `?category&type&status&q&page&limit` | `Event[] + meta` |
| 6 | GET | `/events/:id` | Public | — | `Event` |
| 7 | POST | `/events` | organizer, admin | `CreateEvent` — `status` forced `pending`, `organizer_id` from JWT | `Event` (201) |
| 8 | PUT | `/events/:id` | Owner organizer / admin | `UpdateEvent` (partial) | `Event` |
| 9 | DELETE | `/events/:id` | Owner organizer / admin | — | `204` no body |
| 10 | GET | `/organizer/events` | organizer, admin | `?page&limit` — own events, any status | `Event[] + meta` |
| 11 | POST | `/events/:id/register` | student | `{answer?, attachmentUrl?}` | `Registration` (201) |
| 12 | GET | `/registrations/me` | Any authed | `?page&limit` | `Registration[] + meta` |
| 13 | GET | `/events/:id/registrants` | Owner organizer / admin | `?page&limit` | `Registration[] + meta` |
| 14 | PUT | `/registrations/:id/status` | Owner organizer / admin | `{status: approved \| rejected}`, only from `pending` | `Registration` |
| 15 | GET | `/teams` | Public | `?event_id&page&limit` | `Team[] + meta` |
| 16 | POST | `/teams` | student | `{eventId, title, description, contactInfo, maxMembers?}` | `Team` (201) |
| 17 | POST | `/teams/:id/join` | student | — (not creator/member, quota `maxMembers`) | `TeamMember` (201) |
| 18 | GET | `/admin/events?status=pending` | admin | `?status&page&limit` | `Event[] + meta` |
| 19 | PUT | `/admin/events/:id/status` | admin | `{status: published \| rejected}` | `Event` |
| 20 | GET | `/admin/users` | admin | `?page&limit` | `User[] + meta` |
| 21 | PUT | `/admin/users/:id/role` | admin | `{role: student \| organizer \| admin}` | `User` |

Auth header for protected routes: `Authorization: Bearer <JWT>`.
`password_hash` never appears in any response.

## 4. Error mapping

| Code | HTTP | When |
|---|---|---|
| `VALIDATION_ERROR` | 400 | DTO/bind/validation failure |
| `UNAUTHORIZED` | 401 | Missing/invalid/expired token |
| `FORBIDDEN` | 403 | Wrong role or not owner |
| `NOT_FOUND` | 404 | Entity not found |
| `EMAIL_TAKEN` | 409 | Register with existing email |
| `ALREADY_REGISTERED` | 409 | Duplicate `(event_id, user_id)` |
| `EVENT_QUOTA_FULL` | 422 | `current_participants >= quota` |
| `EVENT_DEADLINE_PASSED` | 422 | `now() > deadline` |
| `EVENT_NOT_PUBLISHED` | 422 | Register/mutate non-`published` event |
| `INTERNAL_ERROR` | 500 | Unexpected failure |

## 5. Registration rules (server-side, transactional)

1. Event exists and `status = published`.
2. `now() <= deadline`, else `EVENT_DEADLINE_PASSED`.
3. `current_participants < quota` (row lock / atomic guard), else `EVENT_QUOTA_FULL`.
4. No existing `(event_id, user_id)` (unique index final guard), else `ALREADY_REGISTERED`.
5. Insert registration + increment `current_participants` in one transaction.

## 6. Decision log (ambiguity resolved, frozen)

1. **Category values**: PRD §10 uses spaced labels (`Minat Bakat`); contract uses slugs (`minat_bakat`). Labels move to `frontend/lib/constants.ts`. Backend validates slugs only.
2. **Event type**: PRD §10 lists 6 values; contract adds `riset` per `01-architecture.md:87` (keilmiahan mapping in `00-project-overview.md:33` needs it).
3. **`status=open|closed` on `GET /events`** is a derived availability filter, distinct from stored `EventStatus`. `04-ui-context.md:30` confirms.
4. **Register always creates `student`**; organizer granted via `PUT /admin/users/:id/role`. Admin seed provides first admin.
5. **Event creation forces `pending`**; only admin publishes. Public reads see `published` only.
6. **`answer` + `attachment_url`** (nullable) adopted for registrations; **`start_date`, `end_date`** (nullable) adopted for events; **`team_members`** + `POST /teams/:id/join` adopted — all from tracker proposals, needed by flows.
7. **DELETE event** included (owner/admin) per architecture; PRD table omits it.
8. **Rejecting a registration**: whether `current_participants` decrements is decided in unit 08 and documented in Swagger then.
9. **Enums stored as varchar** + Go/DTO validation, not native PG ENUM (AutoMigrate limitation).
10. **Token storage**: `localStorage` MVP isolated in `lib/auth.ts` (XSS risk noted); httpOnly cookie deferred.

Frozen for FE-02. Any change requires a contract amendment entry here plus updates to `frontend/lib/types.ts` and the tracker.
