# 16 — Edge Behavior

Goal: Custom edges, any-handle to any-handle, inline labels.

## Implementation
- `components/editor/CanvasEdge.tsx`: custom edge (distinct from default organic line), easier click target.
- Handles on all 4 sides (top/right/bottom/left); connect any→any; store `sourceHandle/targetHandle`.
- Inline label editing (blur/Enter/Escape; `preventDefault`+blur-guard to avoid double Liveblocks mutations; add missing Enter handler).
- New chat per spec to keep context small.

## Verify
- [ ] Side-origin connections render correctly; labels save once; build passes.
