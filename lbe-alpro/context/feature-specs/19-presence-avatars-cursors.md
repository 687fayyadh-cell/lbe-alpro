# 19 — Presence Avatars + Cursors

Goal: See collaborators live.

## Implementation
- `components/editor/PresenceCursors.tsx` inside canvas wrapper: remote `cursor` + name + color.
- `components/editor/CollaboratorAvatars.tsx`: stacked avatar group top-right (Clerk avatar or initial).
- Uses existing presence types; no new room logic.

## Verify
- [ ] Two tabs show each other's cursor + avatar stack; build passes.
