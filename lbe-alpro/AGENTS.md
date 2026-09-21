# AGENTS.md — Ghost AI

> Next.js 16 note: training data may be outdated. Before writing Next.js code, read the applicable guide under `node_modules/next/dist/docs/`.

## Context-first workflow (mandatory)

Before implementing anything, read in order:

1. `context/00-project-overview.md`
2. `context/01-architecture.md`
3. `context/02-code-standards.md`
4. `context/03-ai-workflow-rules.md`
5. `context/04-ui-context.md`
6. `context/05-progress-tracker.md`

Then read the specific `context/feature-specs/<nn>-*.md` for the current unit.

## Rules

- Work on ONE feature spec at a time. Do not combine unrelated boundaries.
- Mark unit `in-progress` in `05-progress-tracker.md` before coding, `completed` after build passes.
- Never go beyond spec scope. Ask on ambiguity.
- Verify with `npm run build` (plus `tsc` / `eslint` if present) per spec checklist.
