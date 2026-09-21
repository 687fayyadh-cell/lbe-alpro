# Current Issues (do NOT commit with tokens — gitignored)

## 1. Save button status
- Symptom: …
- Fix: wire autosave hook to navbar button (`Save/Saving/Saved/failed`); Blob `private` + `allowOverwrite:true`.

## 2. Delete nodes/edges
- Backspace/Delete with selected nodes does nothing. Add keydown listener (ignore input/textarea); use Liveblocks `onDelete` (F11 `remove` case was no-op).

## 3. Edge handles
- Connections always from bottom. Allow top/right/bottom/left → any.

## 4. Drop offset
- Node lands lower than cursor. Fix coordinate calc at current zoom.

## 5. Auto-zoom on first node
- Check Liveblocks skill, then fit on drop.

## 6-7. Clerk avatars/buttons
- Add Clerk image domain to `next.config`; keep single `UserButton`.

Template for new bug:
`Symptom / URL / logs / expected. Ask agent to ANALYZE first, then wait for green light.`
