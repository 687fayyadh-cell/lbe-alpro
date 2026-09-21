# Code Standards

- TypeScript `strict: true`. Never use `any`; prefer `unknown` + narrowing. Fix all `tsc` errors before marking complete.
- Next.js App Router. Server components by default; add `"use client"` only for interactivity (canvas, dialogs, hooks).
- API routes: `async GET/POST/PATCH/DELETE`, `auth()` from Clerk first → `401` if missing → validate input → Prisma check ownership → `403` for non-owner mutations → return JSON with correct status (`201` create, `204` delete).
- Prisma: use `lib/prisma.ts` singleton. Never instantiate `new PrismaClient()` per request. Run `prisma generate && prisma migrate dev` after schema change.
- Liveblocks: mutate via `useLiveblocksFlow` helpers (`onNodesChange({type:'add', item})`, `onDelete`), not direct `storage.get('nodes')` writes to wrong path. Storage lives under `flow` key.
- React 19: no ref writes during render — move to `useEffect`. Handle both `Enter` and `Escape` for label commit; use `preventDefault` + blur-guard to avoid double-commit mutations.
- Styling: no raw Tailwind color hexes. Reference tokens via Tailwind utility names / CSS vars from `globals.css` (e.g. `text-faint`, `bg-canvas`). Dark mode only.
- shadcn/ui: install once (`components/ui/*`); never modify generated files beyond theme. Icons via `lucide-react`.
- `lib/utils.ts`: `cn()` helper (clsx + tailwind-merge).
- Keyboard: lowercase + uppercase handling (`z`/`Z` with caps-lock), `+/-` zoom, `mod+z / mod+y` undo/redo.
- Accessibility: icon-only buttons get `aria-label` + `title`.
- No `console.log` in production paths; Trigger tasks log start/thinking/complete via status feed.
