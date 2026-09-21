# Demo Runbook — SinergiITS Frontend (submission)

## 1. Start backend + database (backend owner)

```bash
# PostgreSQL up, database created, then:
cd backend && go run ./cmd/server/main.go
```

Verify: `http://localhost:8080/api/v1/events` returns the success envelope.
Swagger: `http://localhost:8080/swagger/index.html`.
Seed demo accounts (student, organizer, admin) per backend docs.

## 2. Start frontend

```bash
cp .env.example frontend/.env.local
# ensure: NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
# ensure: NEXT_PUBLIC_USE_MOCK_API=false
cd frontend && pnpm install && pnpm dev
```

App: `http://localhost:3000`.

## 3. Demo script (±10 minutes)

1. **Explore**: open `/`, filter `Keilmiahan + lomba`, search keyword,
   paginate. Point out skeleton → cards → empty state.
2. **Detail + registration**: open an event, `Daftar Sekarang` as student
   (success banner + quota refresh). Then show one error case: re-register
   (duplicate), or a full/closed event (disabled button + reason).
3. **My Registrations**: `/my-registrations` shows history with status badges.
4. **Organizer**: login as organizer → `/organizer/events` → `Buat Event`
   (lands `pending`) → edit → open registrants → approve one (confirm modal,
   toast).
5. **Admin**: login as admin → `/admin/moderation` → approve event to
   `published`; show it appears in Explore.
6. **Mobile**: resize to 390px — navbar sheet, filter grid, tables scroll
   horizontally, modals fit.

## 4. If backend is unavailable

Say so explicitly. Do NOT silently enable mock on the demo machine.
Mock (`NEXT_PUBLIC_USE_MOCK_API=true`) is a documented development fallback
only — demo accounts `demo@student.its.ac.id` / `demo@organizer.its.ac.id`
(`password123`) apply to mock mode, not to the real backend.
