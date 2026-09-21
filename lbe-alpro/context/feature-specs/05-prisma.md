# 05 — Prisma + Postgres

Goal: Project data models, client singleton, first migration. Prisma already installed (`prisma`, `tsx`, `@types/pg`, `@prisma/client`, `@prisma/adapter-pg`, `pg`, `dotenv`).

## Implementation
1. `prisma.config.ts` → schema path `prisma/`.
2. `prisma/models/project.prisma`: `Project{id(cuid), ownerId(clerk), name, description?, status:draft|archived, canvasBlobUrl?, createdAt, updatedAt, collaborators[]}` + index `(ownerId, createdAt)`.
3. `ProjectCollaborator{projectId→Project cascade, email, createdAt}` + unique `(projectId,email)` + indexes. No extra fields.
4. `lib/prisma.ts`: cached singleton; if `DATABASE_URL` starts with `prisma+postgres:` use Accelerate else `@prisma/adapter-pg`.
5. Run `prisma migrate dev` + `prisma generate`. Install Prisma skills (`npx skills add prisma/skills`).
6. `.env.local` `DATABASE_URL` from Prisma dashboard (paste into `.env.local`, not `.env`).

## Verify
- [ ] Both models + relations + indexes; single cached export; migration applied; build passes.
