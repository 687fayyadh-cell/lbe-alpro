# SinergiITS

*Satu Pintu untuk Seluruh Peluang Pengembangan Diri di ITS.*

Centralized full-stack platform for ITS students to discover and register for
self-development events across 4 bidang (Minat Bakat, Kewirausahaan,
Manajerial, Keilmiahan). Organizers publish events and manage registrants;
admins moderate before events go public. Final Project LBE 2026.

> Contract: `docs/api-contract-v1.md` (frozen v1). E2E notes: `docs/g4-e2e.md`.

## Features

- **Must**: Register/Login JWT + RBAC; event Explore + filter/pagination;
  event detail + registration (quota/deadline/duplicate); My Registrations;
  organizer event CRUD + registrants approve/reject; admin moderation.
- **Should** (implemented, mock-backed until BE ready): Teams board
  (list/create/join), profile, admin moderation queue.
- **Deferred**: user-management tab (needs BE-16), portfolio field (needs BE-18).

## Tech Stack

Next.js 16 (App Router) + TypeScript strict + Tailwind v4 · Go + Gin + GORM ·
PostgreSQL · JWT (Bearer) + bcrypt · Swagger (swaggo) · Bruno.

## Prerequisites

- Node.js 20+ and `pnpm@11.24.0` (`npm install -g pnpm@11.24.0`)
- Go 1.26+ and PostgreSQL 15+ (backend units)
- Backend seed provides demo student/organizer/admin accounts (see backend docs)

## Setup

```bash
# 1. Frontend env (never commit .env.local)
cp .env.example frontend/.env.local
# Edit frontend/.env.local — values below, placeholders only

# 2. Install frontend deps (canonical manager: pnpm, pnpm-lock.yaml)
cd frontend && pnpm install
```

### Frontend environment variables

| Variable | Example | Keterangan |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080/api/v1` | Base URL backend, dibaca saat startup |
| `NEXT_PUBLIC_USE_MOCK_API` | `false` | `false` = API nyata (default). `true` = mock adapter lokal, dev only |

## Run

```bash
# Frontend (http://localhost:3000)
cd frontend && pnpm dev

# Backend (http://localhost:8080, tim backend)
# cd backend && go run ./cmd/server/main.go
```

| Service | URL |
|---|---|
| Frontend | `http://localhost:3000` |
| Backend API | `http://localhost:8080/api/v1` |
| Swagger UI | `http://localhost:8080/swagger/index.html` |

## Verify (frontend)

```bash
cd frontend
pnpm build       # production build (setara npm run build)
pnpm exec tsc --noEmit  # typecheck (setara npx tsc --noEmit)
pnpm lint        # eslint (setara npm run lint)
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
