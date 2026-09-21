# 15 — Node Color Toolbar

Goal: Floating toolbar on selected node; bg+text update instantly for all.

## Implementation
- Toolbar above selected node, palette from UI context (bg + matching text for contrast; reuse `globals.css` else `canvas-types.ts`).
- Select → update `bg` + `textColor` via mutation.

## Verify
- [ ] Colors sync realtime; contrast readable; build passes.
