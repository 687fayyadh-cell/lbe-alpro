# SinergiITS

*"Satu Pintu untuk Seluruh Peluang Pengembangan Diri di ITS."*

Centralized full-stack platform for ITS students to discover and register for
self-development events across 4 bidang (Minat Bakat, Kewirausahaan,
Manajerial, Keilmiahan). Organizers publish events and manage registrants;
admins moderate before events go public. Final Project LBE 2026.

## Features

- **Must**: Register/Login JWT + RBAC; event Explore + filter/pagination;
  event detail + registration (quota/deadline/duplicate); My Registrations;
  organizer event CRUD + registrants approve/reject; admin moderation.
- **Should** (implemented, mock-backed until BE ready): Teams board
  (list/create/join), profile, admin moderation queue.
- **Deferred**: user-management tab (needs BE-16), portfolio field (needs BE-18).

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 16 (App Router) + TypeScript + Tailwind v4 |
| Backend | Go + Gin + GORM |
| Database | PostgreSQL |
| API | REST, documented with Swagger (swaggo) |
| Testing | Bruno collection |

## Prerequisites

- Node.js 20+ and `pnpm@11.24.0` (`npm install -g pnpm@11.24.0`)
- Go 1.26+ and PostgreSQL 15+
- Backend seed provides demo student/organizer/admin accounts (see backend docs)

## Setup

```bash
# 1. Frontend env (never commit .env.local)
cp .env.example frontend/.env.local
# Edit frontend/.env.local — values below, placeholders only

# 2. Install frontend deps (canonical manager: pnpm, pnpm-lock.yaml)
cd frontend && pnpm install
```

### Environment variables

| Variable | Example | Keterangan |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080/api/v1` | Base URL backend, dibaca saat startup |
| `NEXT_PUBLIC_USE_MOCK_API` | `false` | `false` = API nyata (default). `true` = mock adapter lokal, dev only |
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_USER` | `postgres` | PostgreSQL user |
| `DB_PASSWORD` | (empty) | PostgreSQL password |
| `DB_NAME` | `sinergiits` | Database name |
| `JWT_SECRET` | `change-me` | JWT signing secret |
| `PORT` | `8080` | Backend port |
| `CORS_ORIGIN` | `http://localhost:3000` | Allowed CORS origin |

## Run

```bash
# Backend (http://localhost:8080)
cd backend
cp ../.env.example .env   # edit DB_PASSWORD
go run ./cmd/server

# Frontend (http://localhost:3000)
cd frontend
pnpm dev
```

| Service | URL |
|---|---|
| Frontend | `http://localhost:3000` |
| Backend API | `http://localhost:8080/api/v1` |
| Swagger UI | `http://localhost:8080/swagger/index.html` |

### Seed Data

The backend auto-seeds on first run:

| Email | Password | Role |
|---|---|---|
| admin@sinergiits.its.ac.id | admin123 | admin |
| organizer@sinergiits.its.ac.id | org123 | organizer |
| student@sinergiits.its.ac.id | stu123 | student |

Plus 15 demo events across 4 categories.

## Verify (frontend)

```bash
cd frontend
pnpm build            # production build
pnpm exec tsc --noEmit  # typecheck
pnpm lint             # eslint
```

## Mock mode (development only)

```bash
# frontend/.env.local
NEXT_PUBLIC_USE_MOCK_API=true
```

Restart `pnpm dev` after changing env. Mock lives in `frontend/lib/mock.ts`
and is reachable ONLY via `frontend/lib/api.ts` — pages/components never
import it. Switching mock OFF changes no component. Never enable mock for
the final demo without stating it explicitly.

Demo accounts in mock mode: `demo@student.its.ac.id` /
`demo@organizer.its.ac.id`, password `password123`.

## Routes & roles

| Route | Access |
|---|---|
| `/`, `/events/[id]`, `/teams` | Public (daftar/gabung perlu login) |
| `/login`, `/register` | Guest |
| `/my-registrations`, `/profile` | Any logged-in role |
| `/organizer/events…` | organizer, admin |
| `/admin/moderation` | admin only |
| `/forbidden` | 403 state |

## Project structure

```text
lbe-alpro/            # canonical app root
├── frontend/         # Next.js (app/, components/, components/ui/, hooks/, lib/)
├── backend/          # Go + Gin + GORM (cmd/server, internal/...) — tim backend
├── bruno/            # API collection — tim backend
├── context/          # numbered context + feature-specs/
├── docs/             # api-contract-v1.md, g0-kickoff.md, g4-e2e.md
├── .env.example
└── README.md
```

Key frontend modules: `lib/api.ts` (sole HTTP gateway), `lib/auth.ts`
(sole token storage), `lib/types.ts` + `lib/constants.ts` (contract mirror),
`hooks/useAuth.tsx`, `hooks/useToast.tsx`, `components/ui/` (view states).

## API docs

- Frozen contract: `docs/api-contract-v1.md` (base `/api/v1`, envelopes,
  pagination, error codes, decision log).
- Swagger UI: `/swagger/index.html` once backend units land.
- Bruno collection: `bruno/` once API units land.

## Troubleshooting

- **Port 3000 in use**: `pnpm dev -- -p 3001`, or free it. Backend
  `CORS_ORIGIN` must then match the actual FE URL.
- **CORS errors**: backend `CORS_ORIGIN` must equal the FE origin
  (`http://localhost:3000` by default).
- **`NEXT_PUBLIC_API_URL` missing**: copy `.env.example` →
  `frontend/.env.local` and restart `pnpm dev` (Next.js reads env at startup).
- **API 401 loop**: clear token (`localStorage.removeItem("sinergiits_token")`)
  and re-login; 403 means wrong role, not a login bug.
- **Backend down**: every data page shows an error state with `Coba lagi` —
  no blank screens. Check the backend is running on `:8080` first.
- **Stale `.next` after switching branches**: delete `frontend/.next` and
  re-run build/typecheck (generated route types are branch-specific).
