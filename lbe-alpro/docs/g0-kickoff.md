# G0 Kickoff — K-01 Review, K-04 Decisions (branch `fe/init-review`)

## K-01 — Frontend initialization review

Reviewed: `frontend/` (Next 16.3.4, React 19, `packageManager pnpm@11.24.0`),
root `.gitignore`, root `.env.example` (FE section), `frontend/.gitignore`,
`frontend/{next.config.ts, tsconfig.json, eslint.config.mjs, app/}`.

### Findings

| # | Finding | Recommendation | Status |
|---|---|---|---|
| 1 | `frontend/app/page.tsx` is default create-next-app boilerplate | Replace in FE-09 (design-system unit), out of G0 scope | Logged, not touched |
| 2 | `frontend/app/globals.css` uses default Geist light/dark theme, not `04-ui-context.md` dark tokens (`#17191c` base) | Migrate in FE-09, not G0 | Logged, not touched |
| 3 | Root `.env.example` held Ghost AI vars (Clerk/Liveblocks/Trigger) | Replaced with SinergiITS vars (K-04) | Done |
| 4 | `frontend/.gitignore` (create-next-app default) ignores `.env*` — correct | Keep; do not commit `frontend/.env.local` | OK |
| 5 | Root `.gitignore` lacked `current-issues.md` (workflow rule 17) | Added ignore entry | Done |
| 6 | `frontend/lib/`, `frontend/hooks/`, `frontend/components/` missing | `lib/` created in G0 (types/constants/api/auth skeletons); rest in FE units | Partial, by design |
| 7 | No `frontend/.env.local` present — correct (must be created locally, never committed) | K-05 README documents setup | OK |
| 8 | `backend/` holds only `go.mod`/`go.sum`; `bruno/` absent | Backend/contract-consumer work starts Phase A; `bruno/` created with first API unit | Logged, not G0 scope |

No files deleted. No secrets committed.

### Canonical-root conflict (reported, not resolved unilaterally)

- Repo outer root (`./`) holds `PRD.md`, `konteks.md`, minimal `README.md`, minimal `.env.example` (5 DB vars).
- Canonical app root per `AGENTS.md` + `01-architecture.md` is `lbe-alpro/` (has `frontend/`, `backend/`, `context/`, `docs/` now, full `.env.example`, full `README.md` draft).
- `lbe-alpro/README.md` was Ghost AI starter content — overwritten with SinergiITS draft in G0 (K-05, in scope).
- `lbe-alpro/context/feature-specs/` still holds Ghost AI specs (`01-design-system.md` …); tracker expects SinergiITS units (`01-repo-scaffold.md` …). Needs human decision: delete Ghost AI specs or archive under `feature-specs/_archive/`.
- Outer-root `PRD.md`/`konteks.md`/minimal `.env.example` duplicate inner sources of truth. Needs human decision: delete outer duplicates or keep outer root as the repo root and move app up one level.

## K-04 — Auth & runtime decisions (frozen)

- JWT in `localStorage`, isolated in `frontend/lib/auth.ts` (`getToken/setToken/clearToken/isLoggedIn`). Components must never touch `localStorage` directly (use `useAuth` in FE-10).
- All HTTP via `frontend/lib/api.ts` (`apiFetch`), base URL from `NEXT_PUBLIC_API_URL`, `Authorization: Bearer <token>` attached, envelope unwrapped, typed `ApiError {code, message, status}` thrown.
- Frontend `http://localhost:3000`; backend `http://localhost:8080`; `CORS_ORIGIN=http://localhost:3000`; `NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1`.
- XSS risk: any JS on the origin can read `localStorage`. Accepted for MVP; backend stays the real authority (401/403 enforced server-side). Follow-ups: CSP, no inline scripts, short `JWT_EXPIRES_HOURS`, revisit httpOnly cookies.

## Docs/registry of G0 outputs

- `docs/api-contract-v1.md` — frozen contract (K-03).
- `frontend/lib/types.ts`, `frontend/lib/constants.ts` — enum matrix + DTO types (K-02).
- `frontend/lib/api.ts`, `frontend/lib/auth.ts` — skeletons (K-04).
- `README.md` — draft run instructions (K-05).
