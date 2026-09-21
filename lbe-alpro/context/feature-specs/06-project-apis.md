# 06 — Project APIs (backend only, no UI wiring)

Goal: Secure CRUD routes over F05 schema.

## Routes
- `GET /api/projects` — list current user's owned (+ shared stub) projects.
- `POST /api/projects` — create; default missing name → `Untitled project`; use schema ID strategy (no sequential IDs).
- `PATCH /api/projects/[id]` — rename (owner only).
- `DELETE /api/projects/[id]` — delete (owner only, return 204).

## Rules
- `auth()` → ownerId; unauthed → 401; non-owner mutation → 403.
- Server-side enforcement (not just client hiding).

## Verify
- [ ] All routes exist; 401/403 handled; `npm run build` passes.
