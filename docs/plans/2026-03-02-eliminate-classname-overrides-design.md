# Eliminate className Overrides & Raw HTML from Business Components

**Date**: 2026-03-02
**Branch**: codex/architecture-refactor
**Status**: Approved

## Problem

Business components in `pages/` have two architectural violations:

1. **className overrides on UI components** — 31 files pass custom Tailwind classes to Button, Card, Input, etc., breaking the component contract (e.g. `<Button className="bg-green-600 hover:bg-green-700">`).
2. **Raw HTML with Tailwind** — 408 raw `<div>`/`<span>` elements across 90 files build layout/styling that should be expressed through components.

## Principle

- **Domain-agnostic variants** (success, danger, compact, warning) belong in `components/ui/`.
- **Domain-specific compositions** stay in `pages/` and use those variants without className.
- Business components express **intent** (what), not **appearance** (how).

## Design

### Part A: UI Component Variant Expansions

#### Button — new variants

| Variant | Purpose | Replaces |
|---------|---------|----------|
| `success` | Green confirm/approve actions | `className="bg-green-600 text-white hover:bg-green-700"` |
| `warning` | Amber/orange caution actions | `className="bg-amber-600 hover:bg-amber-700"` |
| `success-outline` | Outlined green (approve in tables) | `className="border-green-300 text-green-700 hover:bg-green-50"` |
| `destructive-outline` | Outlined red (reject in tables) | `className="border-red-300 text-red-600 hover:bg-red-50"` |

#### Input — size variants

Currently has no size system.

| Size | Purpose | Replaces |
|------|---------|----------|
| `sm` | Compact table cell inputs | `className="h-7 w-14 text-xs px-1"` |
| `default` | Standard (current behavior) | — |

#### Card — intent variants

Currently has no variant system.

| Variant | Purpose | Replaces |
|---------|---------|----------|
| `default` | White bg, standard border | current default |
| `muted` | Gray-50 bg, for summary/readonly | `className="bg-gray-50"` |
| `flush` | No padding (for embedding tables) | `className="p-0 overflow-hidden"` |

### Part B: New Shared Primitives

#### ColorValue — semantic number coloring

Replaces the most pervasive anti-pattern: inline ternaries for positive/negative/warning colors.

```tsx
<ColorValue value={margin} sentiment="auto" format="percent" />
```

Props:
- `value`: number or string to display
- `sentiment`: `"auto"` (positive=green, negative=red) | `"positive"` | `"negative"` | `"neutral"` | `"warning"`
- `format`: `"currency"` | `"percent"` | `"days"` | `"number"` | `"raw"`
- `className`: optional, for layout positioning only (not color)

#### Legend — chart/table legend row

Replaces repeated flex+icon+label patterns in work-table-header, project-timesheets-page, etc.

```tsx
<Legend items={[
  { icon: <Lock className="size-2" />, label: "Frozen", color: "slate" },
  { icon: <Circle />, label: "Open", color: "blue" },
]} />
```

Props:
- `items`: array of `{ icon: ReactNode, label: string, color?: string }`
- `className`: optional

#### IconBox — icon in a rounded container

Replaces `<div className="flex size-11 items-center justify-center rounded-xl bg-gray-100">` pattern.

```tsx
<IconBox icon={Building2} size="md" variant="muted" />
```

Props:
- `icon`: Lucide icon component
- `size`: `"sm"` | `"md"` | `"lg"`
- `variant`: `"muted"` | `"primary"` | `"accent"`
- `className`: optional

### Part C: Business Component Cleanup Rules

After expanding the library, business components follow these rules:

1. **Never pass className to a UI component** for visual overrides — use variants/props.
2. **Never use raw `<div>` for layout patterns** that have a component equivalent.
3. **Express intent, not appearance** — `<Button variant="success">` not `<Button className="bg-green-600">`.
4. **Conditional colors via ColorValue** — not inline ternaries with Tailwind classes.
5. **Domain-specific buttons** stay in `pages/` composing UI variants: `<Button variant="success" onClick={onApprove}>Approve</Button>`.

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
