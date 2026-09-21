# 01 — Design System

Goal: Install design tokens + UI primitives. Everything later builds on this.

## Design
- Dark theme only. Translate `context/04-ui-context.md` tokens into `app/globals.css` CSS vars. No hardcoded hexes in components.
- shadcn/ui + Tailwind. Never modify generated `components/ui/*` after install except theme.

## Implementation
1. Install + configure shadcn/ui (style-neutral, CSS vars, `lib/utils.ts` with `cn()` via clsx+tailwind-merge).
2. Add components: `button`, `dialog`, `tabs`, `input`, `label`, `avatar`, `tooltip`, `dropdown-menu`, `badge`, `skeleton`, `scroll-area`.
3. Install `lucide-react`.
4. Wire tokens in `globals.css` (background/surface/canvas/border/text/faint/accent + radius + fonts). Fix circular font-var self-reference.
5. Keep `app/page.tsx` as centered `Ghost AI` div to verify theme.

## Verify
- [ ] `components/ui/button` imports without errors; `cn()` merges classes.
- [ ] Dark background renders on `/`; no default light styling.
- [ ] `tsc` + `eslint` clean, `npm run build` passes.
