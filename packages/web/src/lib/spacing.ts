/**
 * Spacing token system
 *
 * Defines the standard spacing values used across the application.
 * Instead of ad-hoc Tailwind values, use these semantic tokens
 * to maintain visual consistency.
 *
 * Scale (Tailwind units → rem):
 *   1 = 0.25rem    3 = 0.75rem    6 = 1.5rem
 *   1.5 = 0.375rem 4 = 1rem
 *   2 = 0.5rem     5 = 1.25rem
 *
 * ┌─────────────────────────────────────────────────┐
 * │ PAGE                                   space-y-6 │
 * │  ┌───────────────────────────────────┐           │
 * │  │ SECTION (card/tab)       space-y-4 │          │
 * │  │  ┌─────────────────────┐           │          │
 * │  │  │ GROUP (list)  sp-y-3 │          │          │
 * │  │  │  ┌───────────┐      │          │          │
 * │  │  │  │TIGHT sp-y-1│     │          │          │
 * │  │  │  └───────────┘      │          │          │
 * │  │  └─────────────────────┘           │          │
 * │  └───────────────────────────────────┘           │
 * └─────────────────────────────────────────────────┘
 *
 * Inline gaps:
 *   gap-1.5  icon ↔ text, tight button pairs
 *   gap-2    button groups, small control rows
 *   gap-4    form fields (vertical), grid cells, header ↔ actions
 */

// -- Vertical stacking between siblings ----------------------------------

/** Between top-level cards/tables on a page (1.5rem) */
export const PAGE_GAP = 'space-y-6'

/** Between elements inside a card or tab panel (1rem) */
export const SECTION_GAP = 'space-y-4'

/** Between items in a list or compact group (0.75rem) */
export const GROUP_GAP = 'space-y-3'

/** Title + subtitle, label + value (0.25rem) */
export const TIGHT_GAP = 'space-y-1'

// -- Inline gaps between horizontal siblings -----------------------------

/** Icon ↔ text, tight button pairs (0.375rem) */
export const INLINE_TIGHT = 'gap-1.5'

/** Button groups, small control rows (0.5rem) */
export const INLINE_GAP = 'gap-2'

/** Form fields vertical, grid cells, header ↔ actions (1rem) */
export const FIELD_GAP = 'gap-4'

// -- Table cell vertical padding -----------------------------------------

/** Standard table row padding (0.75rem) */
export const CELL_PY = 'py-3'

/** Compact table row padding for editable/dense tables (0.5rem) */
export const CELL_PY_COMPACT = 'py-2'
