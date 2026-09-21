AGENTS.md — SinergiITS

Next.js note: training data may be outdated. Before writing Next.js code, read the applicable guide under frontend/node_modules/next/dist/docs/ if it exists, otherwise the official Next.js docs. Do the same for Gin, GORM, and swaggo/swag.

SinergiITS is a full-stack platform where ITS students discover and register for events across the four bidang pengembangan (Minat Bakat, Kewirausahaan, Manajerial, Keilmiahan), and where organizers publish events and manage registrants. Final Project LBE 2026. Full spec: PRD.md.

Stack (fixed by the assignment)
Frontend: Next.js (App Router) in frontend/
Backend: Golang + Gin + GORM in backend/
Database: PostgreSQL
API: REST, documented with Swagger (swaggo), tested with Bruno (bruno/)
Repo layout
sinergi-its/
├── frontend/     # Next.js
├── backend/      # cmd/server, internal/{config,handler,service,repository,model,middleware}, docs/
├── bruno/        # API collection
├── context/      # numbered context files + feature-specs/
├── PRD.md
├── .env.example
└── README.md
Context-first workflow (mandatory)

Before implementing anything, read in order:

context/00-project-overview.md
context/01-architecture.md
context/02-code-standards.md
context/03-ai-workflow-rules.md
context/04-ui-context.md
context/05-progress-tracker.md

Rules
Work on ONE feature spec at a time, in ONE layer (backend or frontend). Do not combine unrelated boundaries.
Mark the unit in-progress in 05-progress-tracker.md before coding, completed after verification passes.
Never go beyond spec scope. Never add tables, columns, endpoints, or response fields that are not in PRD.md; ask on ambiguity and resolve open items in the tracker first.
Backend layering: handler → service → repository → model. Business rules (quota, deadline, duplicates, ownership, RBAC) live in the service/middleware, not in handlers or the frontend.
Every endpoint ships with swaggo annotations, regenerated docs/, and Bruno requests for success and failure cases.
Every response uses the standard envelope: {success, message, data} or {success:false, error:{code, message}}. Routes live under /api/v1.
Never commit secrets (.env, JWT_SECRET, DB dumps, tokens). Only .env.example with placeholders.
Verification (per spec checklist)

Backend, from backend/:

gofmt -l . (must print nothing)
go vet ./...
go build ./...
go test ./... if tests exist
swag init -g cmd/server/main.go --parseInternal -o docs whenever handler annotations change

Frontend, from frontend/:

npm run build
npx tsc --noEmit
npm run lint

Then run the unit's Bruno requests against the local backend.