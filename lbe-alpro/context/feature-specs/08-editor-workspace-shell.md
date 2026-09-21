# 08 — Editor Workspace Shell (`/editor/[roomId]`)

Goal: Secure room route (the 404 after create becomes real).

## Implementation
1. `app/editor/[roomId]/page.tsx` (server): unauthed → `/sign-in`; missing/no-access → `<AccessDenied/>`.
2. `components/editor/AccessDenied.tsx`: centered lock icon + short message + link to `/editor`.
3. `lib/access.ts`: `getProjectAccess(userId, roomId)` via Clerk identity + Prisma owner/collaborator check.
4. `WorkspaceShell`: full-viewport; topbar (project name + navbar actions incl. Share), left ProjectSidebar (current room highlighted), center canvas placeholder (dark bg), right placeholder for AI chat. NO canvas/Liveblocks/AI/sharing logic yet.

## Verify
- [ ] Owner sees shell; incognito/no-access sees denied; logged-out redirects; build passes.
