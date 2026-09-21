# SinergiITS — Project Overview

## Summary

SinergiITS is a centralized full-stack web platform for ITS students to discover and join self-development activities across the 4 bidang pengembangan (Minat Bakat, Kewirausahaan, Manajerial, Keilmiahan). Organizers (HMD, Ormawa, UKM, independent committees) publish events and manage registrants; admins moderate events before they go public. Tagline: *"Satu Pintu untuk Seluruh Peluang Pengembangan Diri di ITS."*

Final Project LBE 2026 (ITS). Stack is mandated: Next.js, Go + Gin + GORM, PostgreSQL, REST API, Swagger, Bruno/Postman.

## Problem

1. Event info is fragmented (Instagram, WhatsApp groups, posters) → students miss deadlines.
2. Organizers struggle to reach cross-department audiences and to manage registrants in a structured way.
3. Students struggle to find teammates for lomba / funmatch.

## Goals

1. Central event directory covering the 4 bidang, with search + filter.
2. Digital event registration with quota and deadline validation.
3. "Cari Tim" (Teaming Up) board for lomba/funmatch.
4. Organizer dashboard to manage events and registrants.
5. Admin moderation so only verified events are public.
6. Every REST endpoint documented in Swagger and covered by a Bruno/Postman collection.

## Bidang pengembangan → event mapping

One `events` table, not one table per bidang. Bidang = `category`, kind of activity = `type`.

| Bidang (`category`) | Typical `type` values |
|---|---|
| `minat_bakat` | `lomba`, `funmatch` (+ Cari Tim) |
| `kewirausahaan` | `bootcamp`, `bazar` (info jualan), `lomba` (bisnis) |
| `manajerial` | `oprec` (kepanitiaan, organisasi, volunteer) |
| `keilmiahan` | `lomba`, `workshop`, `riset` |

## Roles

| Role | Can do |
|---|---|
| `student` | Register/login, browse + filter events, register to event, view own registrations, create/join Cari Tim posts, edit profile |
| `organizer` | Everything a student can, plus create/edit own events (start `pending`), view registrants, approve/reject registrants |
| `admin` | Approve/reject pending events, manage users/organizers, moderate any event or team post |

## Core user flows

**Student registers to event:** login → Explore → filter (e.g. Keilmiahan + lomba) → Event Detail → "Daftar Sekarang" → fill answer/link → submit → server validates status, quota, deadline, duplicate → registration recorded (`pending`).

**Organizer publishes event:** login → Organizer Dashboard → "Buat Event Baru" → fill form (title, category, type, quota, deadline, dates, poster URL, description) → submit → event `pending` → admin approves → `published` (public).

**Cari Tim:** student creates a team post tied to an event → other students browse `/teams` and join → creator sees members.

## Features + tools

- Auth: register/login, bcrypt password hash, JWT (Bearer), role claims (`student|organizer|admin`).
- Event directory: search/filter (category, type, status open/closed, keyword) + pagination.
- Registration: quota/deadline/duplicate validation in a DB transaction.
- Organizer dashboard: event CRUD + registrant table with status update.
- Admin panel: moderation queue + user management.
- Teaming Up board.
- API docs: **swaggo/swag** at `/swagger/index.html`.
- API testing: **Bruno** collection in `bruno/` (success + failure scenarios).

## MoSCoW

| Priority | Feature |
|---|---|
| **Must** | Register/Login JWT + RBAC; event directory + search/filter; event detail; event registration (quota/deadline/duplicate); organizer event CRUD; registrant recap + status update; admin event moderation |
| **Should** | User profile; Teaming Up board (create, list, join); admin user management |
| **Nice** | CSV export of registrants; email / in-app deadline reminders |

If time is short, cut Should/Nice first. Never cut Must.

## In scope

- Next.js pages: auth, explore, event detail, my registrations, teams, organizer dashboard, admin moderation, profile.
- Go REST API under `/api/v1`, layered architecture, JWT + RBAC middleware.
- GORM models + `AutoMigrate` + seed script (admin account, sample events across 4 bidang).
- Swagger annotations on every handler; Bruno collection; README per assignment spec.
- Public GitHub repo with `frontend/`, `backend/`, `bruno/`, `.gitignore`, `.env.example`, `README.md`.

## Out of scope

- Payment gateway, real-time chat, file upload storage (posters/berkas are URL strings).
- Official MyITS SSO (OAuth2/OIDC) — future work.
- WhatsApp/Telegram notifications, personalized recommendation.
- Multi-role per user, event version history, light/dark theme switching.
- Long-running background jobs.

## Success criteria

- [ ] Student can register, login, browse/filter events, and register to an event.
- [ ] Organizer can create an event (`pending`) and see/update its registrants.
- [ ] Admin can approve/reject events; only `published` events appear publicly.
- [ ] Quota full, deadline passed, and duplicate registration are rejected with standard error codes.
- [ ] Frontend reads all data from the backend/PostgreSQL (no hardcoded data).
- [ ] 100% of endpoints appear in Swagger and are covered by the Bruno collection.
- [ ] `go build ./...`, `go vet ./...`, and `npm run build` pass.
- [ ] README complete: name, description, problem, features, tech stack, run instructions, structure, API docs.