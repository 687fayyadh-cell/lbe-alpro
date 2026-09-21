# 23 — Design Agent Logic (the big one)

Goal: Prompt → typed canvas actions applied realtime.

## Implementation
- Update `trigger/design-agent.ts`: check Liveblocks + Trigger skills; follow existing flow/presence patterns.
- Gemini via `createGoogleGenerativeAI` + `generateText` with TOOLS (one tool per action: add/move/resize/update/delete node/edge) — do NOT use `output:object` (breaks on Gemini 2.5; `AI_NoObjectGenerated`). Collect tool calls → final action list.
- Set AI presence `thinking:true` + cursor; broadcast `ai-status` feed (start/thinking/complete); single atomic `mutateStorage` to apply.
- Model: `gemini-2.5-flash` (2.0-flash retired). Test via dashboard with real `roomId` from URL; `trigger dev` must be connected; top-up billing if quota error; replay after fix.

## Verify
- [ ] Test prompt (e.g. realtime chat: ws server + presence + RDBMS + Redis pub/sub + S3) yields ~10+ actions + summary; canvas updates; build passes.
