# 22 — Design Agent API (backend wiring, no logic yet)

Goal: Trigger.dev route + run tracking + minimal task skeleton.

## Implementation
1. Install `@trigger.dev/react-hooks`, `ai`, `@ai-sdk/google`. Get Gemini key (aistudio.google.com) → `GOOGLE_GENERATIVE_AI_API_KEY`. (Alt: OpenRouter + provider swap.)
2. `npx trigger.dev@latest init <projectRef>`; `trigger.config.ts` (project ref, node runtime, `trigger/` dir, maxDuration 3600, retries 3); add `TRIGGER_PROJECT_REF` + `TRIGGER_SECRET_KEY`; run `npx trigger.dev@latest dev` alongside `next dev`; install Trigger skills.
3. `trigger/design-agent.ts`: minimal exported task accepting `{prompt, roomId}` (log/echo only).
4. Prisma `TaskRun{runId, projectId, userId, type, status}` + migration.
5. `POST /api/ai/design`: auth → create TaskRun → `tasks.trigger('design-agent', …)` → return `{runId, publicToken}`. Ownership-checked token route.
6. Delete skeleton dupes (`generate-design`/`generate-spec` placeholders), keep `design-agent`.

## Verify
- [ ] Task appears in Trigger dashboard; test run queues; build passes.
