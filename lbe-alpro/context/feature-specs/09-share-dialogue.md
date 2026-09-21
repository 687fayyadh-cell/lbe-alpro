# 09 — Share Dialogue + Collaborator APIs

Goal: Owner invites by email; collaborators view-only list; copy link.

## Implementation
1. Share button in EditorNavbar → dialog: email invite input, collaborator list (avatar+name via Clerk Backend API, fallback email-only), remove btn (owner only), copy-link + `Copied` feedback with clipboard try/catch + timer cleanup.
2. APIs: `GET /api/projects/[id]/collaborators`, `POST` invite (owner-only, server check), `DELETE` remove (owner-only).
3. `hooks/useProjectShare.ts` + `lib/clerk-emails.ts` (cap fetch ≤500, handle reload errors — surface, don't swallow).
4. Keys must be unique (don't collide on displayName).

## Verify
- [ ] Invite appears under Shared for invitee; invitee lacks rename/delete; copy works; build passes.
