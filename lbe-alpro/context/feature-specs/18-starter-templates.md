# 18 — Starter Templates

Goal: Start from prebuilt diagram, not blank canvas.

## Implementation
- `lib/templates.ts`: 3+ templates (microservices, CI/CD pipeline, event-driven) each `{nodes[], edges[]}` pre-labeled.
- Templates button (topbar) → WIDE overlay modal; cards wide enough to show full mini-diagram preview (SVG-based) + name; `Import` clears existing + adds template + `fitView`.
- Fix width issues via corrective prompt with before/after screenshots if cards look vertical/cramped.

## Verify
- [ ] Import into new + existing project works; preview legible; build passes.
