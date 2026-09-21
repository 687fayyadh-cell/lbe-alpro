# 17 — Canvas Ergonomics

Goal: Zoom bar, keyboard, remove minimap.

## Implementation
- Bottom-left pill: zoom-in/out, fit-view, undo/redo (aria-label+title each).
- Keys: `+/=` in, `-` out, `mod+z`/`mod+Z` undo, `mod+y` redo (handle caps-lock uppercase).
- Remove `<MiniMap>`.
- Move ref writes into `useEffect` (React 19).

## Verify
- [ ] Buttons + keys work; no minimap; a11y names present; build passes.
