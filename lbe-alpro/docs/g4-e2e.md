# G4 F-01 — E2E Support Report (frontend)

Date: 2026-09-22. Mock ON (`NEXT_PUBLIC_USE_MOCK_API=true`).
Backend unavailable (see blockers). UI flows verified via compiled
`lib/api.ts` harness (`proof.js`, `proof-g2.js`, `proof-g3.js`: 52/52 PASS)
plus HTTP 200 sweep of all routes on `http://localhost:3000`.

## Must Have flows

| # | Flow | Result |
|---|---|---|
| 1 | Register → login → logout | PASS (register student-only, `EMAIL_TAKEN` 409, wrong password `UNAUTHORIZED` 401, session restore via `getMe`, logout clears token → `/login`) |
| 2 | Explore → filter → pagination → detail | PASS (category/type/open-closed/q, page/limit meta, detail + 404) |
| 3 | Register event sukses | PASS (`pending`, quota incremented) |
| 4 | Register gagal: quota penuh / deadline lewat / duplikat | PASS (`EVENT_QUOTA_FULL`, `EVENT_DEADLINE_PASSED`, `ALREADY_REGISTERED`, `EVENT_NOT_PUBLISHED` with 422/409) |
| 5 | My registrations | PASS (own rows, event enrichment, guest → login) |
| 6 | Organizer create/edit → registrants → approve/reject | PASS (create forced `pending`, validation 400, owner/admin gate 403, approve only from `pending`, optimistic + rollback) |
| 7 | Admin moderation approve/reject | PASS (pending queue, confirm modal, optimistic + rollback, non-admin 403) |
| 8 | Teams/profile (Should Have) | PASS (list/filter/create/join + full/duplicate/own errors; profile load/save/validation + context sync) |

## FE bugs fixed in F-01

None outstanding. Audits: zero `console.log`, zero TODO/FIXME, zero
hardcoded fallbacks, zero `any`, zero direct `fetch`/mock imports outside
`lib/api.ts`. Prior units already fixed: async rejection consistency,
lint `set-state-in-effect` patterns, stale `.next` cross-branch artifact.

## Backend / contract blockers (for backend owner)

| Endpoint | Expected (contract v1) | Actual | UI impact |
|---|---|---|---|
| `GET /api/v1/events` (+ all `/api/v1/*`) | 200 envelope + `meta` | Connection refused, `http://localhost:8080` down (no backend code in repo) | All data pages show `ErrorState` + retry; no crash (verified pattern, mock OFF build passes) |
| `GET /events/:id` organizer shape | `organizer` object TBD (G2 blocker 1) | Unverified | UI shows `Penyelenggara ID N` fallback |
| `POST /events/:id/register` body | `answer`/`attachment_url` accepted (G2 blocker 2) | Unverified | Modal sends both nullable fields; harmless if ignored, breaks if backend 400s unknown fields — confirm |
| `GET /registrations/me` shape | Pagination + embedded event TBD (G2 blocker 3) | Unverified | Page does N+1 `getEventById`; works either way, slower if not embedded |
| Organizer CRUD / moderation payloads | Per contract (G2 blocker 4) | Unverified | Real-path URLs/methods/headers proven via stubbed-fetch harness (5/5) |
| Reject → quota decrement (tracker unit 08) | Decision pending | Unverified | Mock does not decrement; UI re-fetches counts after actions |

No `backend/` or `bruno/` files were touched.
