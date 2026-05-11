# BACKLOG

## Legend
- **Size**: XS / S / M / L / XL
- **Risk**: LOW / MED / HIGH
- **Status**: QUEUED / IN_PROGRESS / DONE / BLOCKED

---

## Active

| ID | Task | Size | Risk | Status |
|----|------|------|------|--------|
| T006 | Complete i18n migration — remaining ~50 files | M | LOW | QUEUED |
| T007 | Playwright e2e: one-month lifecycle — foundation done (config + globalSetup + 3 smoke tests). Full lifecycle expansion → T007.b | M | MED | IN_PROGRESS |
| T007.b | Expand e2e lifecycle: edit/save/submit timesheet → approve → advance window through the month → create snapshot | M | MED | QUEUED |
| T011 | ~~Verify timesheet model invariants~~ — VERIFIED + 2 BUGS FIXED. (a) `status` is only on `Timesheet`, never on `TaskTimesheet` ✓. (b) cross-month weeks correctly emit two slices ✓. Bugs found and fixed in `period-utils.ts` (api + web): `getIsoWeekCode` was using the input date instead of its Thursday → Sundays were misclassified into the next ISO week; `nextPeriodSliceKey` was passing composite `periodKey` to `getPeriodDates` → crash on cross-month walk. Both fixed and re-verified via probe (W18 → 2 slices, walk M4__W18 → M5__W18 → M5__W19 → ...) | S | LOW | DONE |
| T012 | Per-day per-task hours + per-cell notes (Design A schedule grid). Schema unique `(timesheetId, slotId, workDate)`, POST `/entries` upsert, new `ScheduleGrid` + `CellPopover`, hours stored as `days` (1h = 0.125d). Tasks rows = slots present in current Timesheet; days = clamped slice range. | M | LOW | DONE |
| T013 | Mon-Fri only + full-day submit gate + Congés row. Schema: new `LeaveDay` model. API: `POST /:id/leave` upsert (0/0.5/1), submit blocks unless every weekday totals 8h (incl. leave). UI: weekend rows hidden, Congés row toggles 0 → ½d → 1d → 0, totals row highlights amber when not 8h, Submit disabled until full. | M | MED | DONE |
| T008 | ~~Investigate TaskTimesheet `cmozx86ei0008220mefjltd9z` showing under toto~~ — RESOLVED: id is a Task id, not TaskTimesheet id. Toto has 2 TaskTimesheets via `ensureTaskTimesheetForSlot` (triggered by work-table assignment in the open period — expected) | S | LOW | DONE |
| T009 | ~~Challenge `Project.status`~~ — DONE (option 2). `ProjectStatus` enum + `Project.status` dropped. `closedAt` nullable added. Project lifecycle now derived: ACTIVE / UPCOMING / CLOSED from `startDate`/`endDate`/`closedAt`. API exposes `isActive` boolean + `closedAt`. Endpoints: `POST /:id/close`, `POST /:id/reopen`. Replaced `PATCH /status` + DRAFT→…→IN_PROGRESS button chain with a single Close/Reopen toggle. Work-table TO_PLAN gate → "set dates" prompt only. Web filter switched to lifecycle bucket. | S | LOW | DONE |
| T010 | Timeline advancement UI — surface `POST /api/timesheet-window/advance` (admin control to shift the global open week, with current/next/from→to preview) | S | LOW | DONE |

---

## Queue

_(none yet)_

---

## T009 audit notes — `Project.status`

**Enum**: `DRAFT | WAITING_APPROVAL | TO_PLAN | PLANNING | IN_PROGRESS | COMPLETED`

**Reads (used today):**
- `dashboard.ts` — filter active projects (`IN_PROGRESS`) for KPIs + active list
- `clients-page.tsx`, `clients-list-model.ts` — same, count active projects per client
- `client-projects-table.tsx`, `dashboard/active-projects-card.tsx`, `project-details-card.tsx`, `project-header.tsx` — display badge
- `projects-filters.tsx`, `projects-page.tsx` — filter projects list by status
- `client-projects-page.tsx` — sort by status
- `work-table-page.tsx:55` — `TO_PLAN` triggers a "plan first" banner

**Writes:**
- `project-actions.tsx` — DRAFT→TO_PLAN→PLANNING→IN_PROGRESS button chain
- `PATCH /api/projects/:id/status` enforces transitions: `DRAFT→TO_PLAN`, `TO_PLAN→{PLANNING,IN_PROGRESS}`, `PLANNING→IN_PROGRESS`, `IN_PROGRESS→COMPLETED`
- `WAITING_APPROVAL` enum value: **never used anywhere** (orphan)
- `COMPLETED`: enum value exists, button in `project-actions.tsx` is permanently disabled — never reachable

**What the lifecycle really gates:**
- `IN_PROGRESS` = "this project counts as active" (only consequential use — dashboards + filters)
- `TO_PLAN` = pre-planning banner on work-table
- `PLANNING` → `IN_PROGRESS` requires `startDate` + `endDate` set
- The "generate periods" dialog at `TO_PLAN→PLANNING` shows a preview but **periods are no longer a stored entity** (status now globally derived from `GlobalTimesheetWindow`). Misleading UX.

**Verdict**: status enum is over-modelled. Practical signal needed = "is this project active?". Period-related ceremony is vestigial since the global-window refactor.

**Options:**
1. **Slim enum** → `ACTIVE | CLOSED` (or `DRAFT | ACTIVE | CLOSED`). Drop DRAFT/TO_PLAN/PLANNING/WAITING_APPROVAL/COMPLETED ceremony.
2. **Drop status entirely** → derive "active" from `startDate <= today <= endDate`. Add a `closedAt` nullable for explicit early closure.
3. **Keep + clean up** → remove `WAITING_APPROVAL` (unused), wire `IN_PROGRESS→COMPLETED` button properly (currently dead), strip the misleading "generate periods" preview.

Recommended: option 2 (derive). Project lifecycle naturally maps to date range — explicit status was a leftover from per-project period workflow that's now global.

---

## Done

| ID | Task | Notes |
|----|------|-------|
| T001 | Architecture documentation | `docs/architecture.md` — 337 lines, full ERD + domain concepts |
| T002 | i18n audit | ~300 strings identified across ~100 files |
| T003 | i18n setup + partial migration | react-i18next installed, ~50 files migrated, FR/EN toggle working |
| T004 | LanguageToggle UI | `topbar/language-toggle.tsx`, persists to localStorage |
| T005 | Data model reference | `docs/data-model.md` — 17 models, all enums, domain rules |
