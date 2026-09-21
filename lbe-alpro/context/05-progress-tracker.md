Current phase

none — PRD and context files written; repo not yet scaffolded.

Current goal

TBD — start at feature-specs/01-repo-scaffold.md.

In progress
(none)
Completed
(none)
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

Open decisions / PRD gaps

Resolve each in the relevant spec (and amend PRD.md) before that unit is implemented. Proposed answers are suggestions, not decisions.

 UC-05 join team has no endpoint or table. Proposed: team_members(team_id, user_id) with a unique composite index + POST /api/v1/teams/{id}/join. Needed by units 17–18.
 UC-09 / UC-10 admin endpoints missing. Proposed: GET /api/v1/admin/events?status=pending, PUT /api/v1/admin/events/{id}/status, GET /api/v1/admin/users, PUT /api/v1/admin/users/{id}/role. Needed by units 14 and 16.
 Who becomes an organizer? Proposed: register always creates a student; only an admin promotes to organizer. Admin account comes from a seed.
 Registration form answers. The user flow mentions short answers / file link but registrations has no such column. Proposed: nullable answer (TEXT) + attachment_url (VARCHAR). Needed by units 08 and 12.
 Event dates. The organizer flow lists start/end date, but events only has deadline. Proposed: add start_date, end_date. Needed by units 03, 07, 15.
 Quota accounting. Proposed: increment current_participants on registration; decrement if the organizer later rejects it. Confirm in unit 08.
 Event DELETE. The assignment brief's example CRUD includes it; the PRD table does not. Proposed: skip for MVP, or soft delete by organizer-owner.
 ENUM columns. GORM AutoMigrate will not create native PostgreSQL enums. Proposed: varchar + CHECK constraint + Go-side validation.
 Frontend token storage. Proposed: localStorage + auth context with client-side route guards. Confirm in unit 10 (weigh XSS risk against the extra complexity of httpOnly cookies).
 Home route. PRD lists / as both landing and Explore. Decided in 04-ui-context.md: / is Explore, no marketing landing.
Session notes
(versions, gotchas: e.g. Go version, Next.js version, swag init must be re-run after any annotation change, CORS must allow the frontend origin (http://localhost:3000) on the backend, Gin JSON binding errors need mapping to the standard error envelope)

- G0 (branch fe/init-review): contract v1 frozen in docs/api-contract-v1.md; enums slugs (category snake_case, type +riset) with UI labels in frontend/lib/constants.ts; DTOs in frontend/lib/types.ts; auth skeletons frontend/lib/{api,auth}.ts (localStorage MVP, Bearer via apiFetch); runtime FE :3000 / BE :8080 / CORS_ORIGIN http://localhost:3000; .env.example replaced (Ghost AI vars removed); frontend pm = pnpm@11.24.0 (Node v24.21.0). Next.js bundled docs absent in Next 16 (node_modules/next/dist/docs missing) — used standard CLI for smoke. Open human decisions: Ghost AI feature-specs cleanup + outer-root PRD/konteks duplication (see docs/g0-kickoff.md).