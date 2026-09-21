# 14 — Node Resizing + Inline Label Editing

Goal: Select-to-resize, double-click to edit.

## Implementation
- `@xyflow/react` `NodeResizer` on selected; dimension changes via Liveblocks `onNodesChange` automatically.
- Double-click → `contentEditable` div (NOT textarea — keeps text centered while typing) → commit on blur/Enter/Escape (guard double-commit).
- Expand `CanvasNode` types as needed for type-safety.

## Verify
- [ ] Resize from corners/edges; aspect hold on corner; label stays centered while typing; build passes.
