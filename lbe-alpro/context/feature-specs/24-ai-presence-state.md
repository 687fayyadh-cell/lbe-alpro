# 24 — AI Presence State

Goal: Shared activity indicator while AI generates.

## Implementation
- Extend `TaskRun` types + `liveblocks.config.ts` presence (`aiThinking`, `aiStatus`).
- Sidebar status pill + thinking spinner cursor; disable composer input while active.

## Verify
- [ ] All tabs see `Working…/Analyzing…`; input disabled; build passes.
