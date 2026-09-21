# 11 — Base Canvas (Liveblocks + ReactFlow)

Goal: Replace placeholder with real shared canvas. Multi-user nodes/edges sync.

## Implementation
- `lib/canvas-types.ts`: typed `CanvasNode{ id, type:shape, x,y,w,h,label,bg,textColor }`, `CanvasEdge{id,source,target,sourceHandle,targetHandle,label?}`.
- Extend `liveblocks.config.ts` storage for flow.
- `components/editor/CanvasRoom.tsx`: `LiveblocksProvider` + `RoomProvider(id=roomId, initialStorage:{flow:{nodes:[],edges:[]}})` + connection status (`Connecting…`).
- `components/editor/CanvasEditor.tsx`: `ReactFlow` + `useLiveblocksFlow`; drag sources OUTSIDE `<ReactFlow>`; `onDragOver/onDrop` on OUTER WRAPPER div (not on ReactFlow — pointer/D3 conflict). No controls/custom nodes yet.

## Verify
- [ ] Two tabs same room see each other; reload keeps state; no `auth failed` (keys set); build passes.
