# 29 — Spec UI Integration

Goal: Wire Specs tab end-to-end.

## Implementation
- Specs tab: `Generate spec` → list of specs → preview modal (markdown renderer, WIDE enough) → Download btn.
- New routes from F28 consumed here. Debug no-op button via terminal logs + Trigger `runs` view (payload = nodes/edges/architecture).

## Verify
- [ ] Generate → appears → preview legible → download opens full file; build passes. Full app E2E: two tabs collaborate + AI design + spec.
