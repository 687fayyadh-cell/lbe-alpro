# 02 — Editor Shell (navbar + sidebar + dialog pattern)

Goal: Base chrome framing every editor screen. No auth, no project creation yet.

## Design
- `EditorNavbar`: fixed top height, 3 sections (left: sidebar toggle, center: project name, right: actions slot). Dark bg + subtle bottom border.
- `ProjectSidebar`: floats OVER canvas (`absolute/fixed` + z-index, backdrop scrim on mobile). Does NOT push content. Header `Projects` + close btn, shadcn `Tabs` (My/Shared), empty placeholder states, full-width `New project` + plus icon at bottom.
- Dialog pattern: use existing tokens; support title/description/footer. Don't build concrete dialogs yet.

## Implementation
- `components/editor/EditorNavbar.tsx` (props: projectName?, onMenu, actions?)
- `components/editor/ProjectSidebar.tsx` (props: `isOpen`, `onClose` — both required)
- `components/ui/dialog` reuse. No layout wiring yet.

## Verify
- [ ] Components compile, no TS/lint errors.
- [ ] Dialog pattern ready for reuse.
