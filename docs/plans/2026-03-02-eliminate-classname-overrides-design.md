# Eliminate className Overrides & Raw HTML from Business Components

**Date**: 2026-03-02
**Branch**: codex/architecture-refactor
**Status**: Approved

## Problem

Business components in `pages/` have two architectural violations:

1. **className overrides on UI components** — 31 files pass custom Tailwind classes to Button, Card, Input, etc., breaking the component contract (e.g. `<Button className="bg-green-600 hover:bg-green-700">`).
2. **Raw HTML with Tailwind** — 408 raw `<div>`/`<span>` elements across 90 files build layout/styling that should be expressed through components.

## Principle — Three-Layer UI Architecture

1. **Primitives** (`components/ui/`) — Button, Dialog, Card with CVA variants. The engine.
2. **Adapters** (`components/ui/` or `components/shared/`) — Domain-agnostic preset compositions: `WarningModal`, `ConfirmModal`, `SuccessButton`, `DangerButton`, `CompactInput`. They wrap primitives with preset styling, hide className/variant details, and carry **zero business knowledge**. Test: *can this adapter exist in a completely different app?*
3. **Business components** (`pages/`) — Use adapters or (when no adapter fits) primitives with variant props. **Never touch className.**

**Prefer adapters over exposing variants.** When an adapter would need to know about domain types (quotes, timesheets, etc.) to work, fall back to exposing the primitive with variants. Otherwise, always create the adapter layer.

## Design

### Part A: Primitive Expansions (Layer 1)

Add variants to existing UI primitives so adapters can compose them.

#### Button — new variants

| Variant | Purpose |
|---------|---------|
| `success` | Green confirm/approve actions |
| `warning` | Amber/orange caution actions |
| `success-outline` | Outlined green for secondary approve actions |
| `destructive-outline` | Outlined red for reject/cancel actions |

#### Input — size variants

| Size | Purpose |
|------|---------|
| `sm` | Compact table cell inputs (h-7, text-xs) |
| `default` | Standard (current behavior) |

#### Card — intent variants

| Variant | Purpose |
|---------|---------|
| `default` | White bg, standard border (current) |
| `muted` | Gray-50 bg, for summary/readonly sections |
| `flush` | No padding, for embedding tables |

### Part B: Adapter Components (Layer 2)

Domain-agnostic compositions that wrap primitives. Business components use these instead of touching Button/Card/Dialog directly with className.

#### Button Adapters

| Adapter | Wraps | Usage |
|---------|-------|-------|
| `SuccessButton` | `Button variant="success"` | `<SuccessButton>Approve All</SuccessButton>` |
| `WarningButton` | `Button variant="warning"` | `<WarningButton>Bypass Warning</WarningButton>` |
| `DangerButton` | `Button variant="destructive"` | `<DangerButton>Close Period</DangerButton>` |
| `ApproveButton` | `Button variant="success-outline" size="sm"` | `<ApproveButton onClick={...}>Approve</ApproveButton>` |
| `RejectButton` | `Button variant="destructive-outline" size="sm"` | `<RejectButton onClick={...}>Reject</RejectButton>` |

#### Input Adapters

| Adapter | Wraps | Usage |
|---------|-------|-------|
| `CompactInput` | `Input size="sm"` + centered tabular-nums | `<CompactInput value={days} onChange={...} />` |

#### Modal Adapters

| Adapter | Wraps | Usage |
|---------|-------|-------|
| `ConfirmModal` | Dialog + primary action button | `<ConfirmModal title="..." onConfirm={...}>` |
| `WarningModal` | Dialog + warning-styled action | `<WarningModal title="..." onConfirm={...}>` |
| `DangerModal` | Dialog + destructive action | `<DangerModal title="..." onConfirm={...}>` |

*Note: `ConfirmDialog` already exists in shared/. WarningModal and DangerModal extend the same pattern with different button variants.*

#### Display Adapters

| Adapter | Wraps | Usage |
|---------|-------|-------|
| `ColorValue` | `<span>` with semantic color | `<ColorValue value={margin} sentiment="auto" format="currency" />` |
| `Legend` | flex row of icon+label items | `<Legend items={[{ icon, label, color }]} />` |
| `IconBox` | icon in rounded container | `<IconBox icon={Building2} size="md" variant="muted" />` |
| `SummaryCards` | horizontal row of KpiCards | `<SummaryCards items={[{ label, value }]} />` |

#### ColorValue Props
- `value`: number or string to display
- `sentiment`: `"auto"` (>=0 green, <0 red) | `"positive"` | `"negative"` | `"neutral"` | `"warning"`
- `format`: `"currency"` | `"percent"` | `"days"` | `"number"` | `"raw"`

#### Legend Props
- `items`: array of `{ icon: ReactNode, label: string, color?: string }`

#### IconBox Props
- `icon`: Lucide icon component
- `size`: `"sm"` | `"md"` | `"lg"`
- `variant`: `"muted"` | `"primary"` | `"accent"`

### Part C: Business Component Cleanup Rules (Layer 3)

After building Layers 1 + 2, business components follow these rules:

1. **Prefer adapters** — use `<SuccessButton>`, `<WarningModal>`, `<CompactInput>`, `<ColorValue>` over primitives with variant props.
2. **Fall back to primitives with variants** — when no adapter fits and one would need domain knowledge.
3. **Never pass className to any UI/adapter component** — if you need a new visual variation, create an adapter or variant.
4. **Never use raw `<div>` for patterns that have a component** — use Legend, IconBox, SummaryCards, etc.
5. **Conditional colors via ColorValue** — not inline ternaries with Tailwind classes.

## Worst Offenders (priority cleanup targets)

By raw HTML + className override count:

1. `pages/projects/snapshot-detail/actuals-tab.tsx` — 17 raw elements
2. `pages/projects/snapshot-detail/scope-tab.tsx` — 16 raw elements
3. `pages/projects/work-table/view/margin-insight-panel.tsx` — 14 raw elements
4. `pages/projects/work-table/view/work-table-header.tsx` — 11 raw elements (legend pattern)
5. `pages/timesheets/approvals/approvals-table.tsx` — 10 raw elements + Button color overrides
6. `pages/projects/period-close/step1-checklist.tsx` — 7 raw elements + Button overrides
7. `pages/projects/period-close/step2-reforecast.tsx` — Input size overrides
8. `pages/projects/period-close/step4-confirm.tsx` — 4 Button overrides
9. `pages/clients/client-detail-page.tsx` — raw button + icon container
10. `pages/auth/login-page.tsx` — raw layout divs
