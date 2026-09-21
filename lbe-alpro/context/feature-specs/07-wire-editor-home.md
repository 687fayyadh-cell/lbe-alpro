# 07 — Wire Editor Home to Real APIs

Goal: Replace mock data with real fetching + mutations.

## Implementation
1. `lib/projects.ts`: `getProjectsForUser(userId)` → `{owned, shared}` (server-side; editor home is server component — no client fetch for initial load).
2. `hooks/useProjectActions.ts`: dialog+name+slug+loading state; create → slugify + short unique suffix → `POST /api/projects` → navigate `/editor/<id>` (keep project ID == Liveblocks room ID); rename → `PATCH`; delete → `DELETE` + refresh/redirect. Gate close/redirect on `res.ok` (keep dialog open + surface error on failure).
3. Wire hook into sidebar + dialogs. Create shows room-ID preview; rename prefills; delete shows name. Fix `import {useProjectActions}` as VALUE (not `import type`) where `ReturnType<typeof useProjectActions>` needed.

## Verify
- [ ] Sidebar lists real data; create navigates; rename/delete update live; build passes.
