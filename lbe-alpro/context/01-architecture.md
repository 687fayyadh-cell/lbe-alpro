# Architecture

## Stack

| Layer | Tech | Role |
|---|---|---|
| App | Next.js (App Router) + React 19 + TypeScript | Pages, layouts, server components |
| Auth | Clerk | Identity, `proxy.ts` protection, `UserButton`, collaborator enrichment |
| Canvas | React Flow (`@xyflow/react`) + Liveblocks | Nodes/edges, presence, storage, feeds |
| Background AI | Trigger.dev + Gemini (`ai` + `@ai-sdk/google`) | `design-agent`, `generate-spec` tasks, retries, status tracking |
| DB | Prisma + Postgres | `Project`, `ProjectCollaborator`, `TaskRun`, `ProjectSpec` metadata only |
| Storage | Vercel Blob (private) | Canvas JSON snapshots, generated markdown specs |
| UI | shadcn/ui + Tailwind + lucide-react | Dialog, tabs, buttons, theme tokens |
| Review | CodeRabbit (PR + VSCode ext) | Per-feature review before merge to `main` |

## System boundaries

- `app/` — routes, layouts. `app/api/` = thin request handlers (auth check → validate → Prisma/Trigger/Blob). No long AI work here.
- `app/api/liveblocks/auth` — verify Clerk identity + project membership → issue Liveblocks token. Never issue without membership check.
- `app/api/ai/design`, `app/api/ai/spec` — auth + create `TaskRun` → `tasks.trigger()` → return `runId` + public token. Heavy work in `trigger/`.
- `trigger/` — `design-agent.ts`, `generate-spec.ts`. Max duration 3600s, retries 3x. Uses Liveblocks Node client to mutate storage.
- `lib/prisma.ts` — cached singleton. If `DATABASE_URL` starts with `prisma+postgres:` use Accelerate, else ` @prisma/adapter-pg`.
- `lib/liveblocks.ts` — cached Node client + user color helper.
- `liveblocks.config.ts` — Presence (`cursor`, `thinking`, user meta) + Storage (`nodes`, `edges` under `flow` key for `useLiveblocksFlow`) + feeds (`ai-chat`, `ai-status`).
- `components/editor/` — `EditorNavbar`, `ProjectSidebar`, `CanvasEditor`, `ShapePanel`, `CanvasNode`, `CanvasEdge`, `AISidebar`, `PresenceCursors`, `CollaboratorAvatars`, `ProjectDialogs`, templates.
- `hooks/` — `useProjectDialogs` / `useProjectActions` (dialog+form+loading+mutations), `useProjectShare`, autosave hook.

## Storage model (hybrid)

- Postgres: `Project{id, ownerId(clerk), name, description?, status:draft|archived, canvasBlobUrl?, createdAt, updatedAt}`, `ProjectCollaborator{projectId→cascade, email, createdAt}`, `TaskRun{runId, projectId, userId, type, status}`, `ProjectSpec{id, projectId→cascade, filePath(blob url), createdAt}`. Index `(ownerId, createdAt)`, unique `(projectId, email)`.
- Vercel Blob (private, `allowOverwrite:true` for canvas saves): canvas snapshots `canvas/<roomId>.json`, specs `specs/<projectId>/<ts>.md`. Never stuff JSON/markdown into Postgres.
- Project ID and Liveblocks room ID stay aligned (`/editor/[roomId]`).

## Tool interaction rules

- Do not invent custom WebSockets when Liveblocks is in stack.
- Do not run AI generation inside request handlers; use Trigger.dev.
- Clerk email is source of truth for sharing; enrich via Clerk Backend API for name/avatar, fallback to email-only. Batch/limit to ≤500.
- `proxy.ts` at project root (Next 15+ naming), not `middleware.ts`. Public: `/sign-in`, `/sign-up`; everything else protected by default. Homepage redirects authed→`/editor`, unauthed→`/sign-in`.

## Invariants (never break)

1. Request handlers do not run long-lived AI work.
2. Metadata and large artifacts stored in separate layers.
3. Auth + ownership enforced at every mutation boundary (401 unauthed, 403 non-owner).
4. `use client` only when browser interactivity needed.
5. Canvas schema stays consistent (nodes/edges types shared in `canvas-types`).
6. Blob access = `private`; canvas overwrites allowed.
7. Sidebar/topbar float over canvas (`fixed`/`absolute` + z-index), never shrink it.
