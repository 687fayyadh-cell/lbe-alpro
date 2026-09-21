# SinergiITS

*Satu Pintu untuk Seluruh Peluang Pengembangan Diri di ITS.*

Centralized full-stack platform for ITS students to discover and register for
self-development events across 4 bidang (Minat Bakat, Kewirausahaan,
Manajerial, Keilmiahan). Organizers publish events and manage registrants;
admins moderate before events go public. Final Project LBE 2026.

> G0 status: frontend smoke setup on `fe/init-review`. Contract frozen in
> `docs/api-contract-v1.md`. Enum/type reference in `frontend/lib/`.

## Problem

1. Event info fragmented across Instagram, WhatsApp groups, posters — students miss deadlines.
2. Organizers struggle to reach cross-department audiences and manage registrants structurally.
3. Students struggle to find teammates for lomba/funmatch.

## Features (MoSCoW)

- **Must**: Register/Login JWT + RBAC; event directory + search/filter; event
  detail; event registration (quota/deadline/duplicate); organizer event CRUD;
  registrant recap + status update; admin event moderation.
- **Should**: User profile; Teaming Up board (create, list, join); admin user management.
- **Nice**: CSV export of registrants; deadline reminders.

## Tech Stack

Next.js (App Router) + TypeScript + Tailwind · Go + Gin + GORM · PostgreSQL ·
JWT + bcrypt · Swagger (swaggo) · Bruno.

## Prerequisites

- Node.js 20+ and `pnpm@11.24.0` (`npm install -g pnpm@11.24.0`)
- Go 1.26+ (backend units)
- PostgreSQL 15+ with a database, e.g. `sinergiits`

## Setup

```bash
# 1. Frontend env (never commit .env.local)
cp .env.example frontend/.env.local
# .env.local needs at minimum:
# NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1

# 2. Backend env (from Phase A on; never commit .env)
# copy DB_*/JWT_*/PORT/CORS_ORIGIN entries from .env.example to backend/.env

# 3. Install frontend deps (canonical manager: pnpm, pnpm-lock.yaml)
cd frontend && pnpm install
```

## Run

```bash
# Frontend (http://localhost:3000)
cd frontend && pnpm dev

# Backend (http://localhost:8080, from Phase A on)
# cd backend && go run ./cmd/server/main.go
```

| Service | URL |
|---|---|
| Frontend | `http://localhost:3000` |
| Backend API | `http://localhost:8080/api/v1` |
| Swagger UI | `http://localhost:8080/swagger/index.html` (from first API unit) |

## Verify (frontend)

```bash
cd frontend
pnpm lint        # eslint
npx tsc --noEmit # typecheck
pnpm build       # production build
```

## Project structure

```text
lbe-alpro/            # canonical app root
├── frontend/         # Next.js (app/, lib/, components/, hooks/)
├── backend/          # Go + Gin + GORM (cmd/server, internal/...)
├── bruno/            # API collection (from first API unit)
├── context/          # numbered context + feature-specs/
├── docs/             # api-contract-v1.md, g0-kickoff.md
├── .env.example
└── README.md
```

## API docs

- Frozen contract: `docs/api-contract-v1.md` (base `/api/v1`, envelopes,
  pagination, error codes, decision log).
- Swagger UI: `/swagger/index.html` once backend units land.
- Bruno collection: `bruno/` once API units land.

## Seed accounts

Default admin/seed accounts will be documented here when the backend seed
script lands (Phase A). No credentials are ever committed.

## Troubleshooting

- **Port 3000 in use**: `pnpm dev -- -p 3001`, or free it:
  `npx kill-port 3000`. Backend CORS origin must then match the actual FE URL.
- **CORS errors**: backend `CORS_ORIGIN` must equal the FE origin
  (`http://localhost:3000` by default).
- **`NEXT_PUBLIC_API_URL` missing**: copy `.env.example` → `frontend/.env.local`
  and restart `pnpm dev` (Next.js reads env at startup).
- **`pnpm install` slow on Windows**: re-run until it completes; store is reused.
- **API 401 loop**: clear token (`localStorage.removeItem("sinergiits_token")`)
  and re-login; 403 means wrong role, not a login bug.
