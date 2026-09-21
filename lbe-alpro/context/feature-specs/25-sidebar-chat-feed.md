# 25 — Sidebar Chat Feed (Liveblocks feeds)

Goal: Chat via realtime feeds.

## Implementation
- Two feeds: `ai-chat` (conversation) + `ai-status` (progress). Extend feed message data `{sender, role, content, ts}` alongside status fields.
- `CHAT_FEED_ID` constant; send → appears on all clients instantly.

## Verify
- [ ] Message from tab A appears in tab B; status + chat coexist; build passes.
