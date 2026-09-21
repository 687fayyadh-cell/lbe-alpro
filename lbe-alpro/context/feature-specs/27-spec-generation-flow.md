# 27 — Spec Generation Flow (backend task)

Goal: Canvas + chat → markdown spec via Gemini.

## Implementation
- `trigger/generate-spec.ts`: input `{projectId, roomId, nodes, edges, chatHistory}`; system prompt `You are Ghost AI senior architect…` with spec structure; `generateText` (gemini-2.5-flash) → markdown string. Schema task id + retries.

## Verify
- [ ] Dashboard test run returns markdown; build passes.
