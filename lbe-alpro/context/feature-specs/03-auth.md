# 03 — Auth (Clerk)

Goal: Wire Clerk provider, pages, redirects, route protection, user menu. Clerk already installed (`@clerk/nextjs`); keys in `.env.local`.

## Design
- Clerk dark theme (`@clerk/themes`) + appearance vars mapped to app CSS vars. No hardcoded colors.
- Large screens: 50/50 two-panel (left: logo+tagline+bullets on tinted bg, right: centered Clerk form). Small: form only. Minimal, professional, no gradients/heroes.

## Implementation
1. `proxy.ts` at project root (NOT `middleware.ts` — Next 16 naming). Public: `/sign-in`, `/sign-up` (+ Clerk handshake); protect everything else by default.
2. Wrap root layout in `ClerkProvider` with dark theme + vars.
3. `app/sign-in/[[...sign-in]]/page.tsx` + `app/sign-up/[[...sign-up]]/page.tsx` using Clerk components.
4. `app/page.tsx`: authed → `/editor`, unauthed → `/sign-in`.
5. Add Clerk `UserButton` to EditorNavbar right section with `afterSignOutUrl=/sign-in`. Keep default user menu. Use existing `NEXT_PUBLIC_CLERK_*` vars; don't rename.
6. Install Clerk agent skills: `npx skills add clerk/skills` (core + nextjs patterns).

## Verify
- [ ] `proxy.ts` exists; public routes open, others redirect.
- [ ] Sign-in/up + GitHub/OAuth + sign-out work; no `unexpected response` (requires correct after-signout URLs + env reload + cookie clear on change).
- [ ] `npm run build` passes.
