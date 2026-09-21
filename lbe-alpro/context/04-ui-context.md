# UI Context

Dark-only engineering-tool aesthetic. Precise, technical, minimal. No gradients, no oversized heroes, no light styling, no scroll-heavy marketing cards.

## Tokens (mirror into `app/globals.css` as CSS vars)

- `--background: #0a0e14` — app base
- `--surface: #11161f` — panels / dialogs
- `--canvas: #0d1117` — canvas background (+ dotted pattern)
- `--border: #1e2530` — subtle borders
- `--text: #e6e9ee` — primary
- `--faint: #8b94a3` — secondary
- `--accent: #6e8bff` — actions / selection
- Node palette (bg + matching text for contrast): purple, green (MongoDB classic), orange, blue, red, yellow — reuse `globals.css` if present else `lib/canvas-types.ts`.

## Conventions

- Font: body + heading via single font var (fix circular `body{font:var(--font-body)}` self-reference; ensure actually applied). Larger auth-form type, 50/50 two-panel auth layout (logo+tagline+bullets left, Clerk form right; form-only on mobile).
- Radius: `0.5rem` cards/dialogs, `999px` pills (shape panel, zoom bar, presence stack).
- Editor: top navbar fixed height (left: sidebar toggle, center: project name, right: share/save/templates/UserButton). Left `ProjectSidebar` floats over canvas (`absolute` + z-index + backdrop scrim on mobile, tap-outside to close). Right `AISidebar` floats over canvas. Canvas fills full viewport, no card boxing/padding.
- Dialogs: shadcn `Dialog` + existing color tokens (title + description + footer actions).
- Canvas: SVG shape rendering scaled to node size, subtle borders, centered labels (contentEditable stays centered while typing), drag ghost preview, four handles (top/right/bottom/left), custom edges with inline labels, floating bottom-center shape pill + bottom-left zoom pill (zoom in/out, fit-view, undo/redo).
- Feedback: `Save` → `Saving…` → `Saved` / `Save failed`; `Copied` temp feedback; `Thinking…` AI spinner cursor + disabled composer while generating.
