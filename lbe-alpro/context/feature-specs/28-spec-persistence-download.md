# 28 — Spec Persistence + Download

Goal: Save spec to Blob + secure download (same pattern as canvas).

## Implementation
1. Prisma `ProjectSpec{id, projectId→cascade, filePath, createdAt}` + migration.
2. After generation: `put(specs/<projectId>/<ts>.md, md, {access:'private'})` → create `ProjectSpec`.
3. `GET /api/projects/[id]/specs` (list, auth+access) + `GET /api/projects/[id]/specs/[specId]/download` (verify ownership + belonging → fetch blob → return as downloadable `.md`).

## Verify
- [ ] Spec row + blob created; download returns file; build passes.
