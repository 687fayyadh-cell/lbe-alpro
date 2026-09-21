# UI Context

Dark-only engineering-tool aesthetic, applied to a campus event directory. Precise, technical, minimal. No gradients, no oversized heroes, no light styling, no marketing landing page. Dense, scannable lists and tables over decorative cards. User-facing copy is in Indonesian; code, routes, and identifiers are in English.

Tokens (mirror into frontend/app/globals.css as CSS vars)
--background: #17191c — app base
--surface: #11161f — cards / panels / dialogs / tables
--border: #1e2530 — subtle borders
--text: #e6e9ee — primary
--faint: #8b94a3 — secondary
--accent: #0b38ee — primary actions / focus / selected filter
Category palette (dark tinted bg + matching light text, contrast ≥ 4.5:1; exact hex chosen in 01-design-system):
Minat Bakat → purple
Kewirausahaan → orange
Manajerial → blue
Keilmiahan → teal
Status palette (same bg + text pairing):
pending → yellow
published / approved → green
rejected → red
Never rely on color alone: badges always carry a text label.
Enum display

API values are the source of truth (see PRD.md §10). Keep them in frontend/lib/constants.ts with a display label + color token per value; components import from there.

category: Minat Bakat | Kewirausahaan | Manajerial | Keilmiahan (contains a space, so always encodeURIComponent in query strings)
type: lomba | bootcamp | oprec | workshop | funmatch | bazar
event status: pending | published | rejected
registration status: pending | approved | rejected
"Open / Closed" is derived, not stored: open = deadline >= now AND current_participants < quota. Show Dibuka, Ditutup, or Kuota penuh.
Conventions
Font: body + heading via a single font var applied through next/font on <html> (no self-referencing body{font:var(--font-body)}; verify it is actually applied). <html class="dark"> with color-scheme: dark.
Radius: 0.5rem cards/dialogs/inputs, 999px pills (category chips, status badges, filter chips).
Layout: top navbar with fixed height (56px), page content in a centered max-w-6xl container with px-4. No sidebar for students. Organizer and admin pages use the same navbar plus a tab row under it.
Navbar: left = wordmark SinergiITS; center = role-gated links (Jelajah, Cari Tim, Organizer for organizer/admin, Moderasi for admin); right = role badge + user menu (Profil, Keluar) or Masuk / Daftar when logged out. Below md the links collapse into a sheet that floats over content with a backdrop scrim; tap outside to close.
Auth pages: 50/50 two-panel layout — left = logo + tagline (Satu Pintu untuk Seluruh Peluang Pengembangan Diri di ITS) + bullets for the four bidang; right = the form. Form-only on mobile. Larger auth-form type.
Dialogs: shadcn Dialog + existing color tokens (title + description + footer actions). Destructive or irreversible actions (register confirmation, join team, reject registrant/event) always confirm in a dialog.
Data display: tables for registrants and moderation queues (sticky header, row status badge, inline status action), cards only for the event directory and team board.
Pages and routes
Route	Access	Key components
/	public	Explore: FilterBar + EventCard grid + pagination (this is the home page, no separate landing)
/auth/login, /auth/register	guest only	two-panel auth layout, form
/events/[id]	public (register button needs login)	detail header, deadline + quota bar, Daftar Sekarang → register Dialog
/teams	public read, student create	team post cards, create-post dialog
/organizer/events	organizer, admin	own-events table, create/edit form, registrants table + status actions
/admin/moderation	admin	pending-events queue, approve/reject actions
/profile	any logged-in role	profile form (bio, department, portfolio)

Guests can browse /, /events/[id], and /teams. Protected routes redirect to /auth/login?next=<path>; a role mismatch renders a 403 state, not a redirect loop.

Reusable components

Navbar, EventCard (poster thumbnail, title, category chip, type chip, deadline, quota bar), FilterBar (category, type, status, keyword), Modal (shadcn Dialog wrapper), CategoryChip, StatusBadge, QuotaBar, DataTable, Pagination, EmptyState, Skeleton, Toast.

Data & API behavior
All calls go through frontend/lib/api.ts (base URL from NEXT_PUBLIC_API_URL, attaches Authorization: Bearer <token>, unwraps the {success, data} envelope).
FilterBar state lives in the URL and mirrors API params exactly: ?category=Keilmiahan&type=lomba&status=open&q=<keyword>&page=1&limit=10. Keyword input is debounced.
Show backend error.message (already Indonesian) in a toast; branch on error.code for special UI (EVENT_QUOTA_FULL, duplicate registration, etc.).
401 → clear token, redirect to login with next. 403 → forbidden state. 404 → not-found state. 5xx → generic toast.
Dates arrive as UTC ISO strings; render in Asia/Jakarta (WIB) as 12 Jun 2026, 23.59 WIB.
Lists always have three states: skeleton while loading, EmptyState with a next action when empty, inline retry on failure.
Feedback
Register: Daftar Sekarang → Mendaftar… → Terdaftar / error toast; button disabled while pending and when already registered, closed, or full.
Forms: Simpan → Menyimpan… → Tersimpan / Gagal menyimpan.
Copy actions: temporary Disalin.
Status changes in tables update the row optimistically and roll back with a toast on failure.