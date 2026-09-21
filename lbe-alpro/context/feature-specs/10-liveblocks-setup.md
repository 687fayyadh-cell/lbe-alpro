# 10 — Liveblocks Setup (infra only)

Goal: Realtime infra: config, client, auth endpoint.

## Implementation
1. Install: `@liveblocks/client @liveblocks/react @liveblocks/react-ui @liveblocks/react-flow @xyflow/react`. Init: `npx create-liveblocks-app@latest --init --framework react`.
2. `liveblocks.config.ts`: Presence (`cursor{x,y}`, `thinking:boolean`, user meta `{name,email,avatar,color}`) + Storage (nodes/edges under `flow` key for `useLiveblocksFlow`) + feeds later.
3. `lib/liveblocks.ts`: cached Node client + `getUserColor()`.
4. `POST /api/liveblocks/auth`: Clerk auth + `getProjectAccess` → `403` if none → `liveblocks.identifyUser` + authorize room. Consult Liveblocks skills (`npx skills add liveblocks/skills`).
5. `.env.local`: `NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY`, `LIVEBLOCKS_SECRET_KEY` (create separate prod project later).

## Verify
- [ ] Token issued only for members; build passes. (Canvas comes in F11.)
