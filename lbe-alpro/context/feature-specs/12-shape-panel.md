# 12 — Shape Panel (drag & drop)

Goal: Floating bottom toolbar to create nodes.

## Implementation
- `components/editor/ShapePanel.tsx`: plain absolutely-positioned div (NOT `<Panel position=bottom-center>`), six draggables: rectangle, diamond, circle, pill, cylinder (DB), hexagon. Payload: `{shape, defaultSize}`; `draggable=true`.
- Drop: read `dataTransfer`, `screenToFlowPosition`, create node `{id: shape-timestamp-counter, label:'', defaultColor}`, via `onNodesChange({type:'add', item})` (correct Liveblocks path — check best-practice skill if drops don't appear).
- Layout fix (same unit): canvas fills viewport (remove card/padding); sidebars float over (absolute+ z-index); dotted bg visible.

## Verify
- [ ] Drag from panel creates node at drop point; build passes.
