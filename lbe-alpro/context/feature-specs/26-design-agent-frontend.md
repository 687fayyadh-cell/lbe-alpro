# 26 — Design Agent Frontend Wiring

Goal: Connect sidebar → Trigger → Liveblocks.

## Implementation
- `AISidebar.handleSend`: push user msg to `ai-chat` → `POST /api/ai/design` → store `{runId, publicToken}` → `useRealtimeRun(runId, token)` (ONLY pass token when run active — eager empty-string validation throws `missing access token`; gate it).
- Show status strip while running; Liveblocks auto-updates canvas; on final status push AI reply to chat, clear presence/loading.

## Verify
- [ ] Prompt (e.g. high-scale e-commerce: gateway + user/auth + NoSQL catalog + Redis + MQ orders) renders diagram + `Completed`; no token error; build passes.
