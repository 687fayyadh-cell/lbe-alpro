# AI Workflow Rules

1. Work on ONE feature unit / subsystem at a time. Never combine backend + frontend + canvas in one step unless the spec says so.
2. Always open a NEW chat per spec. Stay in same chat only for focused fixes to that unit.
3. Prompt template: `Read <spec-file>. Update context/05-progress-tracker.md to mark this in-progress, then implement exactly as specified.`
4. Read spec + all six context files + referenced skills (Clerk / Prisma / Liveblocks / Trigger.dev) BEFORE coding. Save plan, then execute.
5. Stay in lane: do not touch sidebar/navbar when spec says not to; do not rebuild Clerk internals; do not add extra Prisma fields.
6. When stuck: write analysis to `context/feature-specs/current-issues.md` first (symptom + logs + hypothesis), propose fix, wait for green light — don't spiral-fix and break 10 things.
7. Corrective prompts must be focused: what is wrong, what is expected, file + screenshot reference, definition of done.
8. After each unit: run build, update progress tracker (phase, decisions, session notes), push to `development` branch, get CodeRabbit review, fix, then merge to `main`.
9. Never commit `context/feature-specs/current-issues.md` with tokens; add to `.gitignore`. Never commit `.env.local` or `.seed-backups/`.
10. Prefer agent skills over guessing: `npx skills add clerk/skills`, `prisma/skills`, `liveblocks/skills`, `trigger.dev/skills`. Explicitly tell agent to consult them for that vendor's work.
