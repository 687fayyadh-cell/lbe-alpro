# Ghost AI — AI starter kit (from transcript)

Spec-driven build. Agent reads `AGENTS.md` → `context/00..05` → one `context/feature-specs/*.md` at a time.

## New project quickstart

```bash
npx create-next-app@latest .  # React+TS+ESLint+Tailwind+App Router
# clean boilerplate, keep favicon, minimal page.tsx "Ghost AI"
npm run dev  # localhost:3000
```

Copy this `ghost-ai/AGENTS.md`, `ghost-ai/context/`, `ghost-ai/.env.example` into the new app root.
Create accounts: Clerk, Liveblocks, Prisma Postgres, Vercel Blob, Trigger.dev, Google AI Studio.

## Order

`01-design-system` → `02-editor-shell` → `03-auth` → `04-dialogues` → `05-prisma` → `06-apis` → `07-wire-home` → `08-workspace` → `09-share` → `10-liveblocks` → `11-canvas` → `12-shapes` → `13-18 canvas polish` → `19-presence` → `20-ai-shell` → `21-autosave` → `22-26 design agent` → `27-29 spec gen` → deploy (Vercel, prod keys, `prisma generate` postinstall).

## Prompt template per unit

`Read context/feature-specs/<nn>-*.md. Update context/05-progress-tracker.md to in-progress, then implement exactly as specified.`

## Gotchas (from transcript)

- Next 16: `proxy.ts` not `middleware.ts`.
- Blob: `access:'private'`, `allowOverwrite:true` for canvas.
- Liveblocks storage under `flow` key; `onDrop` on outer wrapper, drag sources outside `<ReactFlow>`.
- Trigger long AI work only; `npx trigger.dev@latest dev` alongside `next dev`.
- Gemini: use `gemini-2.5-flash` + tool-calling, not `output:object`.
- `useRealtimeRun`: pass token only when run active.
- Git: `development` → PR → CodeRabbit → `main`. Gitignore `current-issues.md`, `.env.local`.
