# Ghost AI — Project Overview

## Summary

Ghost AI is a realtime collaborative system-design workspace. Users describe a system in plain English, an AI agent maps it onto a shared canvas, collaborators refine the architecture, and the app generates a technical specification (markdown) from the resulting graph.

## Goals

1. Let authenticated users create and manage architecture projects.
2. Let users collaborate realtime on a shared canvas (cursors, presence, nodes/edges sync).
3. Let AI generate an initial architecture from a natural-language prompt onto the canvas.
4. Provide starter system-design templates importable at any time.
5. Convert canvas graph + chat history into a persistent downloadable markdown spec.

## Core user flow

1. Sign in (Clerk) → redirect to `/editor`.
2. Create project (name + auto slug) → navigate to `/editor/[roomId]`.
3. Design architecture: drag shapes, resize, label, color, connect edges, or use Templates, or prompt AI Architect.
4. Collaborate: share by email, presence avatars/cursors, Liveblocks sync + autosave to Vercel Blob.
5. Generate spec from Specs tab → preview markdown → download.

## Features + tools

- Auth / route protection / ownership: **Clerk** (`@clerk/nextjs`, `proxy.ts`, Clerk dark theme + CSS vars).
- Collaborative canvas: **React Flow (@xyflow/react)** + **Liveblocks** (`@liveblocks/client`, `@liveblocks/react`, `@liveblocks/react-ui`, `@liveblocks/react-flow`).
- Starter templates: curated library (microservices, CI/CD pipeline, event-driven).
- AI design generation: **Trigger.dev** background tasks + **Google Gemini** via Vercel AI SDK (`ai` + `@ai-sdk/google`). Long runs never block API routes.
- Spec generation: Trigger.dev `generate-spec` task → markdown → Vercel Blob → secure download route.
- Database: **Prisma + Postgres** (`Project`, `ProjectCollaborator`, `TaskRun`, `ProjectSpec`).
- Storage: **Vercel Blob** (private, `BLOB_READ_WRITE_TOKEN`). Postgres = metadata only.

## In scope

- Editor navbar + project sidebar shell, home empty state.
- Create / rename / delete project dialogues + sidebar actions.
- Clerk sign-in/sign-up two-panel pages, `proxy.ts` protection, `UserButton`.
- Prisma models + migrations + `lib/prisma.ts` singleton.
- Project CRUD APIs with owner checks (401/403).
- Workspace route with access control + access-denied UI.
- Share dialogue (invite/remove/list by email, copy link).
- Liveblocks auth endpoint, canvas room, shape panel, node shapes, editing, colors, edges, ergonomics, templates, presence, AI sidebar shell, autosave + save button.
- Trigger.dev setup + design agent + presence state + chat feed + frontend wiring.
- Spec generation + persistence + UI integration.
- Production deploy (Vercel) with prod keys.

## Out of scope

- Billing / subscriptions.
- Enterprise permissions / roles beyond owner-collaborator.
- Spec version history.
- Light mode.
- Custom WebSocket implementation (use Liveblocks).
- Long AI work inside API routes (use Trigger.dev).

## Success criteria

- [ ] Signed-in user can create and open a project.
- [ ] Multiple users can collaborate realtime (nodes + cursors sync).
- [ ] AI prompt produces nodes/edges on canvas with status updates.
- [ ] Canvas persists across reload (Blob autosave).
- [ ] Graph + chat can be converted into a persistent downloadable markdown spec.
- [ ] `npm run build` passes; protected routes return 401/403 correctly.
