# 04 — Project Dialogues (UI only, no API)

Goal: Editor home + create/rename/delete dialogues + sidebar actions with MOCK data.

## Design
- Reuse editor layout; center: heading `Create a project or open an existing one` + description + `New project` + plus (no cards).
- Create dialog: name input + live slug preview (updates while typing, validate non-empty slug — reject names with only special chars).
- Rename: prefilled input. Delete: show project name + Cancel/confirm.
- Sidebar items: Rename/Delete visible only for owned projects; mobile tap-outside closes (+ scrim).

## Implementation
- `hooks/useProjectDialogs.ts`: dialogType/form(name,slug)/loading/mock projects + open/close/submit stubs.
- `components/editor/ProjectDialogs.tsx` wired to hook. Home button + sidebar create → create; sidebar rename/delete → respective.
- No fetch calls.

## Verify
- [ ] Slug preview works + empty-slug rejected; dialogs open/close; no TS/lint errors.
