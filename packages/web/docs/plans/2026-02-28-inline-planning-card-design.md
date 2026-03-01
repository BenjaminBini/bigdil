# Inline Planning Detail Card

## Problem

The PM needs to distribute remaining days across profile×task rows while seeing the financial impact (project margin, period production, period margin) in real time. Currently the frozen summary columns show this data but there's no focused per-line feedback or "remaining to distribute" concept.

## Design

### Trigger & Behavior

- Click any **profile-level row** in the work table to expand an inline detail card below it
- **Accordion**: opening one card closes any previously open card
- Available for `TO_PLAN` and `IN_PROGRESS` projects
- The PM edits weekly cells in the row above; the card is read-only feedback that updates live

### Card Layout: Three Zones

```
┌──────────────────┬──────────────────────┬──────────────────────┐
│  ① PLANNING      │  ② TOTAL (this line) │  ③ PERIOD (current)  │
│                   │                      │                      │
│  Quoted:   25.0d  │  Cost:     17,600€   │  Cost:      1,680€   │
│  Planned:  22.0d  │  Revenue:  30,000€   │  Revenue:   3,600€   │
│  To plan:   3.0d  │  Margin:   12,400€   │  Margin:    1,920€   │
│  ████████░░ 88%   │           (41.3%)    │            (53.3%)   │
└──────────────────┴──────────────────────┴──────────────────────┘
```

**① Planning** (left):
- Quoted days: from validated quotes for this profile×task
- Planned days: sum of all allocated days (actual + remaining)
- To plan: `quoted - planned`
  - Green when 0 (fully planned)
  - Amber when > 0 (needs distribution)
  - Red when < 0 (over-planned)
- Progress bar: `planned / quoted`

**② Total** (center):
- Cost: total planned days × cost rate (for this line, all periods)
- Revenue: quoted days × sell rate
- Margin: revenue - cost, with percentage
- Green/red coloring on margin

**③ Period** (right):
- Cost: days in active period × cost rate
- Revenue: days in active period × sell rate
- Margin: revenue - cost for active period, with percentage

### Replan After Period Close

When days were planned but not fully spent:
- "To plan" increases by unspent days
- Amber badge visible on the row even when collapsed
- PM can redistribute days into future weeks
- OR click "Mark as done faster" to remove days (pure margin benefit)

### Project-Level Footer

Sticky bar at the bottom of the viewport:

```
┌──────────────────────────────────────────────────────────────┐
│  Total to plan: 3.0d │ Project margin: 45,200€ (18.4%)      │
└──────────────────────────────────────────────────────────────┘
```

## Data Flow

The inline card reads from the same data the frozen columns already compute (`FrozenData` map). No new data fetching needed — it's a different presentation of existing computed values plus the new "to plan" metric (quoted - total planned days).

## Scope

- Phase 1: Add inline card to IN_PROGRESS projects (Project 1 & 3 have data)
- Phase 2: Initial planning flow for TO_PLAN projects
- Phase 3: Replan workflow after period close (mark as done faster)

## Implementation in Phase 1

- Add `expandedRow` state to track which profile row is open
- Render a `<tr>` with full colSpan below the expanded row containing the card
- Card reads from `frozenDataMap` (already computed) + `GridRow.quotedDays`
- "To plan" = `quotedDays - totalDays` (from GridRow)
- Card updates reactively since frozen data is recomputed on any cell edit
