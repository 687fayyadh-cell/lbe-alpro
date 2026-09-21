# 13 — Node Shapes

Goal: Real shape rendering + drag preview (no more all-rectangles).

## Implementation
- `components/editor/CanvasNode.tsx`: SVG per type scaled to node size, subtle border, centered label. Keep wired to collaborative state (no rebuild).
- Ghost drag preview while dragging.

## Verify
- [ ] Each type renders correct SVG variant; move/sync still realtime; build passes.
