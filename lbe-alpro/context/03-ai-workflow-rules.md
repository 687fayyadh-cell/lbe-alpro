# AI Workflow Rules

Work on ONE feature unit at a time, in ONE layer. A unit is either a backend endpoint group or a frontend page group. Never combine backend + frontend in one step unless the spec says so. Backend units ship first so the frontend always consumes a real, already-tested endpoint (no mocked endpoints for anything that exists).
Always open a NEW chat per spec. Stay in the same chat only for focused fixes to that unit.
Prompt template: Read context/feature-specs/<nn>-<name>.md. Update context/05-progress-tracker.md to mark this in-progress, then implement exactly as specified.
Read the spec + all six context files + the PRD.md sections the spec references BEFORE coding. Save the plan, then execute.
Stay in lane: do not touch navbar/layout when the spec says not to; do not refactor code from earlier units; do not add tables, columns, endpoints, or response fields that are not in PRD.md. If something is missing, stop, propose a PRD amendment, wait for approval, update PRD.md + the tracker decision log, then implement.
Backend layering is strict: handler → service → repository → model. Handlers only bind/validate/respond (no GORM). Services hold business rules (quota, deadline, duplicate registration, ownership) and never see *gin.Context. Repositories are the only place that touches GORM. Registration creation runs inside a DB transaction.
Every API unit is only done when it ships all of:
swaggo annotations on each handler (@Summary, @Tags, @Param, @Success, @Failure, @Security BearerAuth where private) and regenerated docs/
Bruno requests in bruno/ covering the success case AND the failure cases (no/invalid token, wrong role, validation error, and quota full / duplicate / deadline passed where relevant)
responses that follow the standard envelope ({success, message, data} / {success:false, error:{code, message}})
Frontend units use the shared API client (frontend/lib/api.ts) and the enum constants (frontend/lib/constants.ts). No inline fetch in components, no hardcoded category/type/status strings.
When stuck: write analysis to context/feature-specs/current-issues.md first (symptom + logs + hypothesis), propose a fix, wait for the green light. Do not spiral-fix and break 10 things.
Corrective prompts must be focused: what is wrong, what is expected, file + screenshot / Bruno request reference, definition of done. Template: Bug: <symptom>. Expected: <behavior>. Where: <file / endpoint / page>. Done when: <check>.
After each unit: run the verification commands from AGENTS.md (backend and/or frontend), run the unit's Bruno requests against the local server, update the progress tracker (phase, decisions, session notes), push to the development branch, get CodeRabbit review, fix, then merge to main.
Never commit secrets or local artifacts: .env, backend/.env, frontend/.env.local, JWT_SECRET, real DB dumps, Bruno environment files that hold tokens, or context/feature-specs/current-issues.md (add all to .gitignore). Only .env.example with placeholder values is committed.
Cut-line when time is short: drop NICE TO HAVE units first, then SHOULD HAVE, never MUST HAVE (MoSCoW tags are in the tracker). Mark dropped units as dropped in the tracker, don't silently delete them.
Prefer official docs over guessing: Gin, GORM, swaggo/swag, golang-jwt, and the Next.js docs bundled in frontend/node_modules/next/dist/docs/. Explicitly tell the agent to check them before writing framework-specific code.