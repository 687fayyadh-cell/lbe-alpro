# SinergiITS

*"Satu Pintu untuk Seluruh Peluang Pengembangan Diri di ITS."*

Platform web full-stack terpusat untuk mahasiswa ITS menemukan dan mendaftar kegiatan pengembangan diri (lomba, bootcamp, oprec, workshop, funmatch, bazar, riset) across 4 bidang pengembangan.

## Problem

1. Informasi kegiatan tersebar di Instagram, WhatsApp, poster — mahasiswa sering melewatkan deadline.
2. Penyelenggara kesulitan menjangkau audiens lintas departemen dan mengelola pendaftar.
3. Mahasiswa kesulitan mencari tim untuk lomba/funmatch.

## Goals

1. Direktori event terpusat dengan search + filter.
2. Pendaftaran event digital dengan validasi kuota dan deadline.
3. Papan "Cari Tim" untuk lomba/funmatch.
4. Dashboard penyelenggara untuk mengelola event dan pendaftar.
5. Moderasi admin agar hanya event verified yang publik.

## Features

| Priority | Feature |
|---|---|
| **Must** | Register/Login JWT + RBAC; event directory + search/filter; event detail; event registration (quota/deadline/duplicate); organizer event CRUD; registrant status update; admin event moderation |
| **Should** | User profile; Teaming Up board (create, list, join); admin user management |
| **Nice** | CSV export registrants |

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js (App Router) + TypeScript + Tailwind |
| Backend | Go + Gin + GORM |
| Database | PostgreSQL |
| API | REST, documented with Swagger (swaggo) |
| Testing | Bruno collection |

## How to Run

### Prerequisites

- Go 1.26+
- PostgreSQL 14+
- Node.js 18+ (for frontend)

### Backend

```bash
# 1. Create database
createdb -U postgres sinergiits

# 2. Setup environment
cd backend
cp ../.env.example .env
# Edit .env with your PostgreSQL password

# 3. Run server
go run ./cmd/server
# Server starts on http://localhost:8080
# Swagger UI at http://localhost:8080/swagger/index.html
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# Frontend starts on http://localhost:3000
```

### Seed Data

The backend auto-seeds on first run:
| Email | Password | Role |
|---|---|---|
| admin@sinergiits.its.ac.id | admin123 | admin |
| organizer@sinergiits.its.ac.id | org123 | organizer |
| student@sinergiits.its.ac.id | stu123 | student |

Plus 15 demo events across 4 categories.

## Project Structure

```
lbe-alpro/
├── backend/
│   ├── cmd/server/main.go          # Entry point
│   ├── internal/
│   │   ├── config/                 # Env loading, DB connection
│   │   ├── model/                  # GORM entities + enums
│   │   ├── repository/             # DB queries only
│   │   ├── service/                # Business logic + transactions
│   │   ├── handler/                # HTTP handlers
│   │   ├── middleware/             # AuthJWT, RequireRole, CORS
│   │   ├── dto/                    # Request/response structs
│   │   └── response/               # Envelope helpers
│   └── docs/                       # Swagger generated
├── frontend/                       # Next.js
├── bruno/                          # API collection
├── context/                        # Project specs
├── .env.example
└── README.md
```

## API Documentation

- **Swagger UI**: http://localhost:8080/swagger/index.html
- **Bruno Collection**: Import `bruno/` folder into Bruno

### Key Endpoints

| Method | Path | Description |
|---|---|---|
| POST | /api/v1/auth/register | Register (student) |
| POST | /api/v1/auth/login | Login → JWT |
| GET | /api/v1/events | List published events |
| GET | /api/v1/events/:id | Event detail |
| POST | /api/v1/events/:id/register | Register to event |
| POST | /api/v1/events | Create event (organizer) |
| PUT | /api/v1/admin/events/:id/status | Approve/reject event |

Full list in Swagger UI.

## Architecture

- **Layering**: handler → service → repository → model
- **Auth**: bcrypt password hash, JWT Bearer tokens, role-based access (student/organizer/admin)
- **Registration**: DB transaction with row-level lock prevents overbooking
- **All responses**: standard envelope `{success, message, data}` or `{success:false, error:{code, message}}`
