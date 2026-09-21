# Code Standards

## General

- Language of code, identifiers, comments, commits: English. User-facing UI text and API `message` strings: Bahasa Indonesia.
- Commit style: Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`).
- Never commit `.env`, secrets, or `node_modules`. Keep `.env.example` current.

## Backend (Go + Gin + GORM)

- Go modules, `gofmt` + `go vet` clean before marking complete. Errors are always handled; never `_ =` an error on DB or bcrypt calls.
- Layering: `handler → service → repository`. Handlers call services only; services call repositories only; only repositories import GORM queries. Wire dependencies via constructors (`NewEventService(repo)`), no globals except config.
- Handlers: bind with `ShouldBindJSON` / `ShouldBindQuery`, validate via `binding:"..."` tags, then delegate. Return through `response.Success` / `response.Error` helpers. Never build ad-hoc JSON.
- Status codes: `200` read/update, `201` create, `204` delete (no body), `400` validation, `401` missing/invalid token, `403` wrong role/not owner, `404` not found, `409` conflict (duplicate), `422` business rule violation, `500` unexpected.
- Auth: `AuthJWT` middleware first → `401` if missing/invalid/expired; `RequireRole(...)` → `403`. Read `userID`/`role` from Gin context only, never from request body.
- Ownership check in the service (`event.OrganizerID == userID || role == admin`), not in the handler.
- Passwords: `bcrypt.GenerateFromPassword` (cost ≥ 10). `PasswordHash` has `json:"-"`. Never log passwords or tokens.
- Domain errors: define typed/sentinel errors in `service` (e.g. `ErrQuotaFull`, `ErrAlreadyRegistered`); handlers map them to HTTP status + error code in one place.
- Transactions: multi-step writes (register + increment participants) use `db.Transaction(func(tx *gorm.DB) error {...})`. Repositories accept `*gorm.DB` (or a tx-aware variant) so services can compose them.
- GORM: use parameterized queries only (no string-concatenated SQL). Use `Preload` deliberately; avoid N+1. Paginate all list queries (`limit` ≤ 50). Set `binding`/`gorm` tags for `not null`, `uniqueIndex`, `index`, and composite unique indexes.
- Enums: typed string constants (`type Role string`) with a `Valid()` check; validate at DTO level.
- Config: load from env once in `internal/config`; fail fast if `JWT_SECRET` or DB vars are missing.
- Swagger: every handler has `@Summary`, `@Tags`, `@Accept`, `@Produce`, `@Param`, `@Success`, `@Failure`, `@Security BearerAuth` (for protected), `@Router`. Run `swag init` after any handler/DTO change and commit `docs/`.
- No `fmt.Println` debugging in committed code; use `log` / a small logger.
- Tests (where time allows): table-driven unit tests for service rules (quota, deadline, duplicate). Not required to be exhaustive; Bruno covers API-level checks.

## Frontend (Next.js + TypeScript)

- TypeScript `strict: true`. Never use `any`; prefer `unknown` + narrowing. Fix all `tsc` errors before marking complete.
- App Router. Server components by default; add `"use client"` only for interactivity (forms, filters, modals, auth state).
- All HTTP goes through `lib/api.ts` (base URL from `NEXT_PUBLIC_API_URL`, attaches `Authorization: Bearer`, parses standard envelope, throws typed `ApiError` with `code` + `message`). No raw `fetch` scattered in components.
- Types in `lib/types.ts` mirror backend DTOs (`Event`, `Registration`, `Team`, `User`, `ApiResponse<T>`, `Paginated<T>`). Keep in sync with Swagger.
- Auth: store JWT in one place (httpOnly cookie preferred; `localStorage` acceptable for MVP but isolated in `lib/auth`). Route guards by role for `/organizer/*` and `/admin/*`; backend remains the real authority.
- Every data-driven view handles three states: loading, error (show API `message`), empty.
- Forms: client-side validation for UX (required, quota > 0, deadline in future), but never a substitute for server validation. Disable submit while pending to prevent double submit.
- Show mapped, friendly messages for known error codes (`EVENT_QUOTA_FULL`, `EVENT_DEADLINE_PASSED`, `ALREADY_REGISTERED`).
- Styling: Tailwind utility classes; shared palette via theme tokens/CSS vars, not scattered raw hex. Reusable components: `Navbar`, `EventCard`, `FilterBar`, `Modal`, `DataTable`, `Pagination`, `StatusBadge`.
- Accessibility: icon-only buttons get `aria-label` + `title`; form inputs have labels; modals trap focus and close on `Escape`.
- No `console.log` in committed code.

## API testing & docs

- Bruno collection in `bruno/`, organized by folder (Auth, Events, Registrations, Teams, Organizer, Admin) with an environment file (`baseUrl`, `token`).
- Each endpoint has at least one success case; critical flows also have failure cases: no token (401), wrong role (403), quota full, deadline passed, duplicate registration, validation error.
- Swagger UI must load at `/swagger/index.html` and list every route with correct schemas.

## README

Must contain: project name, description, problem, features (with MoSCoW status), tech stack, how to run (DB setup, `.env`, `go run cmd/server/main.go`, `npm run dev`), project structure, API docs (Swagger URL + how to import Bruno collection), and default seed accounts.