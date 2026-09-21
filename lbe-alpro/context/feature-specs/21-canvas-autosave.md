# 21 — Canvas Autosave (Vercel Blob)

Goal: Persist canvas so reload never loses work.

## Setup
- Vercel dashboard → Storage → Blob store `ghost-ai`, env `private`. Copy `BLOB_READ_WRITE_TOKEN` to `.env.local`.

## Implementation
1. Install `@vercel/blob`.
2. `PUT /api/projects/[id]/canvas`: auth + access check → `put(canvas/<roomId>.json, JSON, {access:'private', allowOverwrite:true})` → save URL to `Project.canvasBlobUrl`.
3. `GET` same route: verify → fetch blob → return JSON (hydrate on load).
4. Autosave hook (debounced) + explicit Save button (default `Save` → `Saving…` → `Saved`/`Save failed`). NOTE: remove StrictMode `isMounted` guard pattern (double-invoke breaks save in dev); clear stale `.next` cache after Prisma schema change (`canvasBlobUrl`) + restart dev.
5. Follow-up fixes file (`current-issues.md` #2–7): Delete/Backspace handler (ignore inputs), any-side handles, drop-offset fix, auto-zoom on first node (check Liveblocks skill), Clerk avatar domains in `next.config`, dedupe to single `UserButton`.

## Verify
- [ ] Edit → Save → Blob updates (size grows); reload restores position/labels; access=`private`; build passes.
