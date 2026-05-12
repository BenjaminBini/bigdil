# Quote Feature Tasks

## Context

Quote status lifecycle:
- **Brouillon** → `DRAFT`
- **Envoyée** → `SENT`
- **Validée** → `VALIDATED`
- **Refusée** → `REJECTED`
- **Annulée** → `CANCELLED` _(not yet in schema)_

Allowed transitions:
- `DRAFT` → `SENT`, `CANCELLED`
- `SENT` → `VALIDATED`, `REJECTED`, `CANCELLED`
- `REJECTED` → `CANCELLED`, `DRAFT`
- `CANCELLED` → `DRAFT`
- `VALIDATED` → (terminal)

---

## Task 1 — Schema: add CANCELLED to QuoteStatus enum

**File:** `packages/db/prisma/schema.prisma`

Add `CANCELLED` to the `QuoteStatus` enum:

```prisma
enum QuoteStatus {
  DRAFT
  SENT
  VALIDATED
  REJECTED
  CANCELLED   // ← add this

  @@map("quote_status")
}
```

After editing, run:
```bash
cd packages/db && npx prisma db push
```

---

## Task 2 — Frontend type: add CANCELLED to QuoteStatus

**File:** `packages/web/src/api/types.ts`

Update line 6:
```ts
export type QuoteStatus = 'DRAFT' | 'SENT' | 'VALIDATED' | 'REJECTED' | 'CANCELLED'
```

---

## Task 3 — Status colors: add CANCELLED

**File:** `packages/web/src/lib/constants.ts`

Add `CANCELLED` to `quoteStatusColors` record (use neutral/slate styling, similar to DRAFT but slightly different):
```ts
CANCELLED: 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
```

Also add to any other record in that file keyed by `QuoteStatus`.

---

## Task 4 — i18n: add CANCELLED label

**File:** wherever quote status labels are defined (search for `quote.DRAFT` or `quote.SENT` in `packages/web/src/`).

Add:
```json
"CANCELLED": "Annulée"
```

---

## Task 5 — New quote dialog: title only (remove effectiveAt)

**File:** `packages/web/src/pages/projects/quotes/new-quote-dialog.tsx`

Current dialog has two fields: `title` and `effectiveAt`. Remove `effectiveAt` entirely:
- Remove `effectiveAt` state (`useState('')`)
- Remove the `FormField` + `Input` for `effectiveAt`
- Remove `effectiveAt` from `createQuote.mutate({ title, effectiveAt })` → just `{ title: title.trim() }`
- Remove `setEffectiveAt('')` from `handleClose`
- The dialog body becomes single-column (one field only)

The API already accepts `effectiveAt: null` so no backend change needed for creation.

---

## Task 6 — API: delete a DRAFT quote

**File:** `packages/api/src/routes/projects.ts`

Add a new route **before** the existing quote line routes (around line 549):

```ts
// DELETE /api/projects/:id/quotes/:quoteId — delete a DRAFT quote
projectsRouter.delete('/:id/quotes/:quoteId', async (c) => {
  const projectId = c.req.param('id')
  const quoteId = c.req.param('quoteId')

  const quote = await prisma.quote.findFirst({ where: { id: quoteId, projectId } })
  if (!quote) return c.json({ error: 'Quote not found' }, 404)
  if (quote.status !== 'DRAFT') return c.json({ error: 'Only DRAFT quotes can be deleted' }, 400)

  await prisma.$transaction([
    prisma.quoteLine.deleteMany({ where: { quoteId } }),
    prisma.quote.delete({ where: { id: quoteId } }),
  ])

  return c.json({ ok: true })
})
```

---

## Task 7 — API: cancel a quote (DRAFT / SENT / REJECTED → CANCELLED)

**File:** `packages/api/src/routes/projects.ts`

Add after the validate endpoint (around line 640):

```ts
// POST /api/projects/:id/quotes/:quoteId/cancel — cancel a quote
projectsRouter.post('/:id/quotes/:quoteId/cancel', async (c) => {
  const projectId = c.req.param('id')
  const quoteId = c.req.param('quoteId')

  const quote = await prisma.quote.findFirst({ where: { id: quoteId, projectId } })
  if (!quote) return c.json({ error: 'Quote not found' }, 404)

  const cancellable: string[] = ['DRAFT', 'SENT', 'REJECTED']
  if (!cancellable.includes(quote.status)) {
    return c.json({ error: `Cannot cancel a quote with status ${quote.status}` }, 400)
  }

  const updated = await prisma.quote.update({
    where: { id: quoteId },
    data: { status: 'CANCELLED' },
    include: { lines: true },
  })

  return c.json(updated)
})
```

---

## Task 8 — API: validate with user-supplied dates

**File:** `packages/api/src/routes/projects.ts`

Find the existing validate endpoint (around line 624). Currently it sets `validatedAt` to today automatically. Update it to accept `validatedAt` and `effectiveAt` from the request body:

```ts
// POST /api/projects/:id/quotes/:quoteId/validate
projectsRouter.post('/:id/quotes/:quoteId/validate', async (c) => {
  const projectId = c.req.param('id')
  const quoteId = c.req.param('quoteId')
  const body = await c.req.json<{ validatedAt?: string; effectiveAt?: string }>()

  const quote = await prisma.quote.findFirst({ where: { id: quoteId, projectId } })
  if (!quote) return c.json({ error: 'Quote not found' }, 404)
  if (quote.status !== 'DRAFT' && quote.status !== 'SENT') {
    return c.json({ error: `Cannot validate a quote with status ${quote.status}` }, 400)
  }

  const today = new Date().toISOString().slice(0, 10)
  const updated = await prisma.quote.update({
    where: { id: quoteId },
    data: {
      status: 'VALIDATED',
      validatedAt: body.validatedAt ?? today,
      effectiveAt: body.effectiveAt ?? null,
    },
    include: { lines: true },
  })

  return c.json(updated)
})
```

---

## Task 9 — Frontend hooks: add useDeleteQuote, useCancelQuote; update useValidateQuote

**File:** `packages/web/src/api/hooks/index.ts`

### 9a — useDeleteQuote

```ts
export function useDeleteQuote(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (quoteId: string) =>
      apiFetch<{ ok: boolean }>(`/api/projects/${projectId}/quotes/${quoteId}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project', projectId] }),
  })
}
```

### 9b — useCancelQuote

```ts
export function useCancelQuote(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (quoteId: string) =>
      apiFetch<Quote>(`/api/projects/${projectId}/quotes/${quoteId}/cancel`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project', projectId] }),
  })
}
```

### 9c — useValidateQuote: accept dates

Update existing `useValidateQuote` to pass `validatedAt` + `effectiveAt`:

```ts
export function useValidateQuote(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ quoteId, validatedAt, effectiveAt }: { quoteId: string; validatedAt: string; effectiveAt: string }) =>
      apiFetch<Quote>(`/api/projects/${projectId}/quotes/${quoteId}/validate`, {
        method: 'POST',
        body: JSON.stringify({ validatedAt, effectiveAt }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project', projectId] }),
  })
}
```

---

## Task 10 — Frontend: ValidateDialog with date inputs

**File:** `packages/web/src/pages/projects/quote-detail/validate-dialog.tsx`

Rewrite to collect the two required dates:
- `validatedAt` — validation date (label: "Date de validation")
- `effectiveAt` — budget date (label: "Date d'effet budgétaire", description hint: "Date à partir de laquelle le CA et les coûts de ce devis sont pris en compte")

Both fields are `<input type="date">` wrapped in `FormField`. Default `validatedAt` to today. `effectiveAt` has no default.

`onConfirm` callback should receive `{ validatedAt: string; effectiveAt: string }`.

Add validation: both fields required; show `toast.error` if either is empty (handle in parent or inside dialog).

---

## Task 11 — Frontend: QuoteDetailPage — wire up new actions

**File:** `packages/web/src/pages/projects/quote-detail-page.tsx`

Changes:
1. Import `useDeleteQuote`, `useCancelQuote` hooks.
2. Add state: `deleteDialogOpen`, `cancelDialogOpen`.
3. `handleDelete`: call `deleteQuote.mutate(quoteId!)`, on success navigate back to `../../quotes` (relative) and toast.
4. `handleCancel`: call `cancelQuote.mutate(quoteId!)`, on success toast + close dialog.
5. `handleValidate`: update call signature to pass `{ quoteId: quoteId!, validatedAt, effectiveAt }`.
6. Determine `isCancellable`: `['DRAFT', 'SENT', 'REJECTED'].includes(quote.status)`.
7. Pass new props to `QuoteDetailHeader`.

---

## Task 12 — Frontend: QuoteDetailHeader — delete and cancel buttons

**File:** `packages/web/src/pages/projects/quote-detail/quote-detail-header.tsx`

Add props:
```ts
isCancellable: boolean
onDelete: () => void
onCancel: () => void
```

Add buttons to `ActionsRow`:
- Delete button (only if `isDraft`): destructive variant, `Trash2` icon, label "Supprimer"
- Cancel button (only if `isCancellable`): outline/destructive variant, `XCircle` icon, label "Annuler le devis"

Keep existing validate, duplicate, export buttons.

---

## Task 13 — Frontend: delete confirm dialog

Create `packages/web/src/pages/projects/quote-detail/delete-quote-dialog.tsx`.

Simple confirm dialog (similar to existing `ValidateDialog` but with destructive confirm button):
- Title: "Supprimer le devis"
- Body: "Cette action est irréversible. Le devis et toutes ses lignes seront définitivement supprimés."
- Buttons: Cancel (outline) + Supprimer (destructive)

Props: `open`, `onConfirm`, `onClose`.

---

## Task 14 — Frontend: cancel confirm dialog

Create `packages/web/src/pages/projects/quote-detail/cancel-quote-dialog.tsx`.

Simple confirm dialog:
- Title: "Annuler le devis"
- Body: "Le devis passera au statut Annulée. Cette action ne peut pas être défaite."
- Buttons: Retour (outline) + Confirmer l'annulation (default or warning variant)

Props: `open`, `onConfirm`, `onClose`.

---

## Completion checklist

- [x] Task 1 — Schema CANCELLED added + db push
- [x] Task 2 — Frontend QuoteStatus type updated
- [x] Task 3 — Status colors for CANCELLED
- [x] Task 4 — i18n label for CANCELLED
- [x] Task 5 — New quote dialog: title only
- [x] Task 6 — API DELETE /quotes/:quoteId
- [x] Task 7 — API POST /quotes/:quoteId/cancel
- [x] Task 8 — API POST /quotes/:quoteId/validate accepts dates
- [x] Task 9 — Hooks: useDeleteQuote, useCancelQuote, updated useValidateQuote
- [x] Task 10 — ValidateDialog with date inputs
- [x] Task 11 — QuoteDetailPage wires new actions
- [x] Task 12 — QuoteDetailHeader: delete + cancel buttons
- [x] Task 13 — DeleteQuoteDialog component
- [x] Task 14 — CancelQuoteDialog component

---

# Phase Delete & Rename

## Context

A **phase** is a `Task` with `parentTaskId = null`. Deleting a phase also deletes all its child tasks.

Current `DELETE /api/projects/:id/tasks/:taskId` cascades hard-deletes everything (timesheet entries, planned days, quote lines, snapshots). The new rule: **block deletion if any linked data exists** — never silently cascade-delete real work data.

"Linked data" = any of the following for the phase or any of its descendant tasks:
- `quoteLine` rows (any quote, any status)
- `timesheetEntry` rows with `days > 0`
- `plannedDay` rows with `days > 0`

Snapshot rows (`snapshotWorkRow`, `snapshotScopeLine`) are derived/frozen data — also block if present (period has been frozen with this phase in scope).

Entry points for delete and rename:
- **Work plan** (`task-row-controls.tsx`) — already has delete + rename buttons; delete must now respect the guard
- **Quote detail draft grid** (`quote-draft-grid.tsx`) — needs new delete + rename controls on `PhaseRow`, only when `isDraft`

---

## Task 15 — API: guard phase delete against linked data

**File:** `packages/api/src/routes/projects.ts`

Update `DELETE /:id/tasks/:taskId` (around line 518). Before doing anything, check if the task is a phase (no `parentTaskId`) and if so, verify no linked data exists across all descendants.

```ts
projectsRouter.delete('/:id/tasks/:taskId', async (c) => {
  const projectId = c.req.param('id')
  const taskId = c.req.param('taskId')

  const task = await prisma.task.findFirst({ where: { id: taskId, projectId } })
  if (!task) return c.json({ error: 'Task not found' }, 404)

  // Collect all descendant IDs (BFS), including the task itself
  const allIds: string[] = []
  const queue = [taskId]
  while (queue.length > 0) {
    const current = queue.shift()!
    allIds.push(current)
    const children = await prisma.task.findMany({ where: { parentTaskId: current }, select: { id: true } })
    queue.push(...children.map(ch => ch.id))
  }

  // Guard: block if any real data is linked to this phase or its children
  const [quoteLineCount, timesheetCount, plannedDayCount, snapshotWorkCount, snapshotScopeCount] = await Promise.all([
    prisma.quoteLine.count({ where: { taskId: { in: allIds } } }),
    prisma.timesheetEntry.count({ where: { taskId: { in: allIds }, days: { gt: 0 } } }),
    prisma.plannedDay.count({ where: { taskId: { in: allIds }, days: { gt: 0 } } }),
    prisma.snapshotWorkRow.count({ where: { taskId: { in: allIds } } }),
    prisma.snapshotScopeLine.count({ where: { taskId: { in: allIds } } }),
  ])

  if (quoteLineCount > 0 || timesheetCount > 0 || plannedDayCount > 0 || snapshotWorkCount > 0 || snapshotScopeCount > 0) {
    return c.json({
      error: 'Cannot delete phase: linked data exists',
      details: { quoteLineCount, timesheetCount, plannedDayCount, snapshotWorkCount, snapshotScopeCount },
    }, 409)
  }

  // Safe to delete — cascade clean
  await prisma.$transaction([
    prisma.profileTaskPeriodStart.deleteMany({ where: { taskId: { in: allIds } } }),
    ...([...allIds].reverse().map(id => prisma.task.delete({ where: { id } }))),
  ])

  return c.json({ ok: true })
})
```

Note: snapshot/quoteLine/timesheet/plannedDay rows are now only deleted if the guard passes (i.e., counts are all 0 anyway), so no need to delete them explicitly.

---

## Task 16 — Work plan: handle 409 in TaskRowControls

**File:** `packages/web/src/pages/projects/work-table/view/task-row-controls.tsx`

Current `handleDelete` calls `deleteTask.mutate(id)` with a generic error toast. Update `onError` to detect HTTP 409 and show a specific message:

```ts
function handleDelete() {
  const id = row.kind === 'phase' ? row.phaseId : row.taskId!
  const label = row.label
  deleteTask.mutate(id, {
    onSuccess: () => toast.success(t('workTable.deleted', { label })),
    onError: (err) => {
      const is409 = err instanceof ApiError && err.status === 409
      toast.error(is409 ? t('workTable.deleteBlockedLinkedData') : t('workTable.deleteFailed'))
    },
  })
}
```

Add i18n key `workTable.deleteBlockedLinkedData` = `"Impossible de supprimer : des données sont liées à cette phase (devis, feuilles de temps ou jours planifiés)."`.

Check how `ApiError` is structured in `packages/web/src/api/client.ts` and use the correct status field.

---

## Task 17 — Quote detail draft grid: delete button on PhaseRow

**File:** `packages/web/src/pages/projects/quote-detail/quote-draft-grid.tsx`

Add a delete button to `PhaseRow` (the row rendered for each phase in the draft quote grid). Only show when the parent `QuoteDraftGrid` receives `isDraft = true` (already a prop or derivable from `quote.status === 'DRAFT'`).

Approach:
1. Add `onDeletePhase?: (phaseId: string) => void` prop to `PhaseSection` and thread it into `PhaseRow`.
2. In `PhaseRow`, render a small `Trash2` icon button (ghost-destructive, same style as work table) on hover, right-aligned. Stop propagation on click.
3. In `QuoteDraftGrid` (the main export), add `useDeleteTask(projectId)` and pass a handler down:

```ts
function handleDeletePhase(phaseId: string) {
  deleteTask.mutate(phaseId, {
    onSuccess: () => toast.success('Phase supprimée'),
    onError: (err) => {
      const is409 = err instanceof ApiError && err.status === 409
      toast.error(is409
        ? 'Impossible de supprimer : des données sont liées à cette phase.'
        : 'Échec de la suppression')
    },
  })
}
```

No confirm dialog needed (the API already guards against accidental deletion of data-bearing phases; empty phases are safe to delete silently).

---

## Task 18 — Quote detail draft grid: inline rename on PhaseRow

**File:** `packages/web/src/pages/projects/quote-detail/quote-draft-grid.tsx`

Add inline rename to `PhaseRow`, matching the pattern in `TaskRowControls`:

1. Add `onRenamePhase?: (phaseId: string, newName: string) => void` prop to `PhaseSection` and `PhaseRow`.
2. In `PhaseRow`, add local state `renaming: boolean` + `nameVal: string`.
3. When `renaming`, render an `<input>` in place of `{phase.name}` (same style as work table rename input: `border-sky-400`, `focus:ring-sky-400`).
4. `onBlur` / `Enter`: commit if changed and non-empty, call `onRenamePhase(phase.id, trimmed)`. `Escape`: cancel.
5. Add a small `Pencil` icon button (ghost, on hover) that sets `renaming = true`. Show only when `isDraft`.
6. In `QuoteDraftGrid`, add `useUpdateTask(projectId)` and pass handler:

```ts
function handleRenamePhase(phaseId: string, name: string) {
  updateTask.mutate({ taskId: phaseId, name }, {
    onError: () => toast.error('Échec du renommage'),
  })
}
```

---

## Completion checklist (phase tasks)

- [x] Task 15 — API: DELETE /tasks/:taskId blocks on linked data (409)
- [x] Task 16 — Work plan TaskRowControls: handle 409 error message
- [x] Task 17 — Quote draft grid: delete button on PhaseRow
- [x] Task 18 — Quote draft grid: inline rename on PhaseRow

---

# Quote Workflow Bug Fix

## Correct State Machine

```
DRAFT ──────→ SENT ──────→ VALIDATED (terminal)
  │             │
  └──→ CANCELLED ←─┤
        │           └──→ REJECTED
        ↓                    │
       DRAFT ←───────────────┘
```

Full allowed transitions:
- `DRAFT` → `SENT`, `CANCELLED`
- `SENT` → `VALIDATED`, `REJECTED`, `CANCELLED`
- `REJECTED` → `CANCELLED`, `DRAFT`
- `CANCELLED` → `DRAFT`
- `VALIDATED` → _(terminal)_

## Bugs in current / previously-described implementation

| Bug | Location | Impact |
|-----|----------|--------|
| Validate endpoint allows `DRAFT → VALIDATED` | API `/validate` | Bypasses SENT step |
| No `/send` endpoint (DRAFT → SENT) | API | Transition doesn't exist |
| `REJECTED → DRAFT` transition missing | API + frontend | Can't recover a refused quote |
| `CANCELLED → DRAFT` transition missing | API + frontend | CANCELLED was incorrectly terminal |
| Validate button shown when `isDraft` | `quote-detail-header.tsx` | Wrong — only valid when `isSent` |
| Task 7 cancel description correct (DRAFT/SENT/REJECTED → CANCELLED) | API | No change needed there |
| Context block at top of TODO says `DRAFT → VALIDATED` allowed | TODO.md | Documentation error |

---

## Task 19 — Fix TODO.md context block (documentation)

**File:** `TODO.md` — top "Allowed transitions" block

Replace:
```
- `DRAFT` → `SENT`, `VALIDATED`, `CANCELLED`
- `SENT` → `VALIDATED`, `REJECTED`, `CANCELLED`
- `REJECTED` → `CANCELLED`
- `VALIDATED` → (terminal, no transitions)
- `CANCELLED` → (terminal, no transitions)
```
With:
```
- `DRAFT` → `SENT`, `CANCELLED`
- `SENT` → `VALIDATED`, `REJECTED`, `CANCELLED`
- `REJECTED` → `CANCELLED`, `DRAFT`
- `CANCELLED` → `DRAFT`
- `VALIDATED` → (terminal)
```

---

## Task 20 — API: add POST /quotes/:quoteId/send (DRAFT → SENT)

**File:** `packages/api/src/routes/projects.ts`

Add after the cancel endpoint:

```ts
// POST /api/projects/:id/quotes/:quoteId/send — mark quote as sent (DRAFT → SENT)
projectsRouter.post('/:id/quotes/:quoteId/send', async (c) => {
  const projectId = c.req.param('id')
  const quoteId = c.req.param('quoteId')

  const quote = await prisma.quote.findFirst({ where: { id: quoteId, projectId } })
  if (!quote) return c.json({ error: 'Quote not found' }, 404)
  if (quote.status !== 'DRAFT') {
    return c.json({ error: `Cannot send a quote with status ${quote.status}` }, 400)
  }

  const updated = await prisma.quote.update({
    where: { id: quoteId },
    data: { status: 'SENT' },
    include: { lines: true },
  })

  return c.json(updated)
})
```

---

## Task 21 — API: fix validate endpoint — only SENT → VALIDATED

**File:** `packages/api/src/routes/projects.ts`

In the `/validate` endpoint (updated in Task 8), the guard currently reads:
```ts
if (quote.status !== 'DRAFT' && quote.status !== 'SENT') {
```

Change to:
```ts
if (quote.status !== 'SENT') {
  return c.json({ error: `Cannot validate a quote with status ${quote.status}` }, 400)
}
```

---

## Task 22 — API: add POST /quotes/:quoteId/reopen (REJECTED / CANCELLED → DRAFT)

**File:** `packages/api/src/routes/projects.ts`

Add a single "reopen as draft" endpoint covering both REJECTED → DRAFT and CANCELLED → DRAFT:

```ts
// POST /api/projects/:id/quotes/:quoteId/reopen — reopen as DRAFT (from REJECTED or CANCELLED)
projectsRouter.post('/:id/quotes/:quoteId/reopen', async (c) => {
  const projectId = c.req.param('id')
  const quoteId = c.req.param('quoteId')

  const quote = await prisma.quote.findFirst({ where: { id: quoteId, projectId } })
  if (!quote) return c.json({ error: 'Quote not found' }, 404)

  const reopenable: string[] = ['REJECTED', 'CANCELLED']
  if (!reopenable.includes(quote.status)) {
    return c.json({ error: `Cannot reopen a quote with status ${quote.status}` }, 400)
  }

  const updated = await prisma.quote.update({
    where: { id: quoteId },
    data: { status: 'DRAFT' },
    include: { lines: true },
  })

  return c.json(updated)
})
```

---

## Task 23 — Frontend hooks: useSendQuote, useReopenQuote

**File:** `packages/web/src/api/hooks/index.ts`

```ts
export function useSendQuote(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (quoteId: string) =>
      apiFetch<Quote>(`/api/projects/${projectId}/quotes/${quoteId}/send`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.project(projectId) }),
  })
}

export function useReopenQuote(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (quoteId: string) =>
      apiFetch<Quote>(`/api/projects/${projectId}/quotes/${quoteId}/reopen`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.project(projectId) }),
  })
}
```

---

## Task 24 — Frontend: update QuoteDetailPage + QuoteDetailHeader for full workflow

### quote-detail-page.tsx

Add:
```ts
const sendQuote = useSendQuote(projectId!)
const reopenQuote = useReopenQuote(projectId!)
```

Update status derivations:
```ts
const isDraft = quote.status === 'DRAFT'
const isSent = quote.status === 'SENT'
const isValidated = quote.status === 'VALIDATED'
const isRejected = quote.status === 'REJECTED'
const isCancelled = quote.status === 'CANCELLED'
const isCancellable = isDraft || isSent || isRejected
const isReopenable = isRejected || isCancelled
```

Add handlers:
```ts
function handleSend() {
  sendQuote.mutate(quoteId!, {
    onSuccess: () => toast.success(t('quotes.sent')),
    onError: () => toast.error(t('quotes.sendFailed')),
  })
}

function handleReopen() {
  reopenQuote.mutate(quoteId!, {
    onSuccess: () => toast.success(t('quotes.reopened')),
    onError: () => toast.error(t('quotes.reopenFailed')),
  })
}
```

Pass new props to `QuoteDetailHeader`: `isSent`, `isReopenable`, `onSend`, `onReopen`.

### quote-detail-header.tsx

Replace `isDraft` guard on Validate button with `isSent`:
```tsx
{isSent && (
  <Button onClick={onValidate}>
    <CheckCircle size={16} />
    {t('quotes.header.validate')}
  </Button>
)}
```

Add Send button (only when `isDraft`):
```tsx
{isDraft && (
  <Button onClick={onSend}>
    <Send size={16} />
    {t('quotes.header.send')}
  </Button>
)}
```

Add Reopen button (when `isReopenable`):
```tsx
{isReopenable && (
  <Button variant="outline" onClick={onReopen}>
    <RotateCcw size={16} />
    {t('quotes.header.reopen')}
  </Button>
)}
```

Add i18n keys: `quotes.header.send`, `quotes.header.reopen`, `quotes.sent`, `quotes.sendFailed`, `quotes.reopened`, `quotes.reopenFailed`.

---

## Completion checklist (workflow bug fix)

- [x] Task 19 — Fix TODO.md context block transitions
- [x] Task 20 — API POST /quotes/:quoteId/send
- [x] Task 21 — API fix validate: SENT only (remove DRAFT)
- [x] Task 22 — API POST /quotes/:quoteId/reopen
- [x] Task 23 — Hooks: useSendQuote, useReopenQuote
- [x] Task 24 — Frontend: Send + Validate (SENT only) + Reopen buttons

---

# Quote State Machine Diagram

## Task 25 — Frontend: state machine diagram on quote detail page

Create a compact inline component `QuoteStatusStepper` that renders the state machine visually with the current status highlighted. Place it in `QuoteDetailHeader`, between the title row and the meta dates row.

### States to display (in order)

```
Brouillon → Envoyée → Validée
    ↓           ↓
  Annulée ←  Refusée
```

Display as a horizontal stepper for the main path, with CANCELLED and REJECTED as "side" states below.

### Visual spec

Use pure Tailwind + `cn`. No external diagram library.

**Main path** (left to right): Brouillon → Envoyée → Validée  
**Side states** (shown below, connected to their entry points): Refusée (below Envoyée), Annulée (below both Brouillon and Refusée — shared sink)

Layout suggestion — two rows:

```
[ Brouillon ] →→→ [ Envoyée ] →→→ [ Validée ]
      ↘               ↓
       →→→ [ Annulée ] ←←← [ Refusée ]
```

Each state node:
- Small pill/badge, `text-xs`, `rounded-full`, `px-2.5 py-0.5`
- **Inactive**: `bg-muted text-muted-foreground`
- **Active (current status)**: use the color from `quoteStatusColors[status]` (same as `QuoteStatusBadge`) + `ring-2 ring-offset-1 ring-current font-semibold`
- **Terminal** (VALIDATED once reached): add a `✓` checkmark prefix

Arrows between nodes: simple `→` text characters or `ChevronRight` icon (size 12, `text-muted-foreground/50`).

### Component signature

```ts
// packages/web/src/pages/projects/quote-detail/quote-status-stepper.tsx
interface QuoteStatusStepperProps {
  status: QuoteStatus
}

export function QuoteStatusStepper({ status }: QuoteStatusStepperProps) { ... }
```

### Integration

In `quote-detail-header.tsx`, render `<QuoteStatusStepper status={quote.status} />` inside `VStack`, between the title `FlexRow` and the meta dates `FlexRow`.

### Notes

- Component is read-only / display-only — no click handlers
- Must render correctly for all 5 statuses
- Keep compact — max height ~48px total, designed to sit between title and meta without taking too much vertical space

---

# Period System Migration

## Design

### Period codes

Format: `{YEAR}W{N}` (ISO week) or `{YEAR}M{N}` (calendar month).

Examples:
- `2026W1` → ISO week 1 of 2026 (Mon 29 Dec 2025 – Sun 4 Jan 2026)
- `2025M3` → March 2025 (2025-03-01 – 2025-03-31)

Week numbering follows ISO 8601: week 1 is the week containing the first Thursday of the year.

### What changes

| Before | After |
|--------|-------|
| `Period` DB table (per-project entity) | Removed |
| `period.id` UUID FK in all data tables | `periodCode String` in all data tables |
| Period status stored on `Period` row | New `ProjectPeriodStatus` table |
| `period.startDate` / `period.endDate` stored | Computed from code via utility |
| `period.periodNumber` | Not stored; sort by code via utility |
| Project period columns from DB query | Computed from project date range + granularity |

### New DB entities

**`ProjectPeriodStatus`** — stores lifecycle status per (project, period):
```prisma
model ProjectPeriodStatus {
  id          String       @id
  projectId   String       @map("project_id")
  periodCode  String       @map("period_code")
  status      PeriodStatus @default(FUTURE)
  frozenAt    String?      @map("frozen_at")
  project     Project      @relation(fields: [projectId], references: [id])

  @@unique([projectId, periodCode])
  @@map("project_period_statuses")
}
```

Keep `PeriodStatus` enum (FUTURE / OPEN / CONSOLIDATION / FROZEN).

**Project** gets a new field:
```prisma
periodGranularity  PeriodGranularity  @default(MONTHLY)  @map("period_granularity")
```

New enum:
```prisma
enum PeriodGranularity {
  WEEKLY
  MONTHLY
  @@map("period_granularity")
}
```

### Period utility (shared, pure functions)

Create `packages/api/src/lib/period-utils.ts` (also expose from `packages/db` if frontend needs it directly, otherwise duplicate a minimal version at `packages/web/src/lib/period-utils.ts`).

```ts
type PeriodGranularity = 'WEEKLY' | 'MONTHLY'

interface ParsedPeriod { year: number; type: 'W' | 'M'; index: number }

// parsePeriodCode('2026W3') → { year: 2026, type: 'W', index: 3 }
function parsePeriodCode(code: string): ParsedPeriod

// getPeriodDates('2026W1') → { startDate: '2025-12-29', endDate: '2026-01-04' }
// getPeriodDates('2025M3') → { startDate: '2025-03-01', endDate: '2025-03-31' }
function getPeriodDates(code: string): { startDate: string; endDate: string }

// getPeriodLabel('2026W1') → 'Semaine 1, 2026'
// getPeriodLabel('2025M3') → 'Mars 2025'
function getPeriodLabel(code: string): string

// Compare two codes for sorting (returns -1, 0, 1)
function comparePeriodCodes(a: string, b: string): number

// currentPeriodCode('WEEKLY') → '2026W19'
// currentPeriodCode('MONTHLY') → '2026M5'
function currentPeriodCode(granularity: PeriodGranularity): string

// All period codes between two ISO dates (inclusive of containing periods)
function getPeriodsForDateRange(
  startDate: string,
  endDate: string,
  granularity: PeriodGranularity
): string[]

// Next period code after a given code
function nextPeriodCode(code: string): string
```

### How periods are discovered for a project

The work table and other views need the list of periods to display for a project. Algorithm:

```
projectPeriods(project) =
  sort(
    union(
      getPeriodsForDateRange(project.startDate, project.endDate, project.periodGranularity),
      distinct(PlannedDay.periodCode WHERE projectId = project.id),
      distinct(TimesheetEntry.periodCode WHERE projectId = project.id),
      ProjectPeriodStatus.periodCode WHERE projectId = project.id
    )
  )
```

The API endpoint `GET /api/projects/:id/work-table` returns this computed list as:
```ts
periods: Array<{ code: string; startDate: string; endDate: string; label: string; status: PeriodStatus }>
```

---

## Task 26 — Schema migration

**File:** `packages/db/prisma/schema.prisma`

1. Add `PeriodGranularity` enum
2. Add `periodGranularity` to `Project` model
3. Add `ProjectPeriodStatus` model (see design above)
4. Remove `Period` model entirely
5. On `PlannedDay`: remove `periodId String` FK + `period Period @relation(...)`, add `periodCode String @map("period_code")`; update unique constraint to use `periodCode`
6. On `TimesheetEntry`: same — `periodId` → `periodCode`
7. On `ProfileTaskPeriodStart`: `periodId` → `periodCode`
8. On `Snapshot`: `periodId` → `periodCode`; remove `periodNumber Int` field (code is canonical)
9. On `SnapshotWorkRow`: `periodId` → `periodCode`; keep `periodStatus PeriodStatus`
10. Remove `Project.periods Period[]` relation; add `Project.periodStatuses ProjectPeriodStatus[]`

After schema edit:
```bash
cd packages/db && npx prisma db push
```

---

## Task 27 — Period utility library

Create both files:
- `packages/api/src/lib/period-utils.ts`
- `packages/web/src/lib/period-utils.ts`

Same pure-function implementation in both. Implement all 7 functions from the design section.

Implementation notes:
- ISO week: week 1 = week containing first Thursday. Week starts Monday. Use the standard ISO week date algorithm.
- Month: `startDate = new Date(year, month-1, 1)`, `endDate = new Date(year, month, 0)` (last day of month).
- `getPeriodsForDateRange`: find the period containing `startDate`, iterate `nextPeriodCode()` until past `endDate`.
- `comparePeriodCodes`: parse both, compare year ASC, then index ASC. W and M codes are mutually exclusive per project.

---

## Task 28 — API: period-transitions.ts rewrite

**File:** `packages/api/src/routes/period-transitions.ts`

Route param `:pid` (UUID) → `:code` (period code string).

Replace all `prisma.period.findUnique/update/count` with `prisma.projectPeriodStatus` operations.

### open (FUTURE → OPEN)
Absence of a `ProjectPeriodStatus` row = implicit FUTURE status. Upsert on open:
```ts
const existing = await prisma.projectPeriodStatus.findUnique({
  where: { projectId_periodCode: { projectId, periodCode } },
})
const currentStatus = existing?.status ?? 'FUTURE'
if (currentStatus !== 'FUTURE') return c.json({ error: ... }, 400)

const openCount = await prisma.projectPeriodStatus.count({ where: { projectId, status: 'OPEN' } })
if (openCount > 0) return c.json({ error: 'Another period is already OPEN' }, 400)

await prisma.projectPeriodStatus.upsert({
  where: { projectId_periodCode: { projectId, periodCode } },
  create: { id: crypto.randomUUID(), projectId, periodCode, status: 'OPEN' },
  update: { status: 'OPEN' },
})
```

### freeze
- `PlannedDay` filter for "not frozen" periods: query `ProjectPeriodStatus` for `status: 'FROZEN'` codes, exclude those from `PlannedDay.periodCode`
- Snapshot creation: use `periodCode` instead of `periodId`/`periodNumber`
- Next period: `nextPeriodCode(periodCode)` from utility
- `ProfileTaskPeriodStart`: use `periodCode` instead of `periodId`
- "Future planned days" filter: compare `periodCode > periodCode` using `comparePeriodCodes`

---

## Task 29 — API: update all other routes

Files (replace `periodId` → `periodCode`, remove `prisma.period.*` calls):

**`packages/api/src/routes/projects.ts`**
- Remove `generatePeriods` helper
- Remove `prisma.period.createMany(...)` from project transitions
- `GET /:id`: replace `prisma.period.findMany` with `prisma.projectPeriodStatus.findMany`; enrich with `getPeriodDates` + `getPeriodLabel`
- `GET /:id/work-table`: compute `projectPeriods` via union algorithm; return `PeriodInfo[]`
- All `frozenPeriodIds` logic → `frozenPeriodCodes`

**`packages/api/src/routes/work-table-mutations.ts`**
- Replace `periodId` with `periodCode` in schema validation + DB calls
- Remove `prisma.period.findMany` call; use `getPeriodsForDateRange` or `projectPeriodStatus` lookup

**`packages/api/src/routes/timesheet-mutations.ts`**
- `body.periodId` → `body.periodCode`

**`packages/api/src/routes/schemas.ts`**
- `periodId: z.string()` → `periodCode: z.string().regex(/^\d{4}[WM]\d{1,2}$/)`

**`packages/api/src/routes/employees.ts`**
- `period.periodNumber` → `periodCode`; sort via `comparePeriodCodes`

**`packages/api/src/routes/reports.ts`**
- `period.periodNumber` → `periodCode`; sort via `comparePeriodCodes`

**`packages/api/src/routes/dashboard.ts`**
- `prisma.period.findMany(...)` → `prisma.projectPeriodStatus.findMany(...)`

---

## Task 30 — Frontend types

**File:** `packages/web/src/api/types.ts`

Replace `Period` interface:
```ts
export type PeriodStatus = 'FUTURE' | 'OPEN' | 'CONSOLIDATION' | 'FROZEN'

export interface PeriodInfo {
  code: string
  startDate: string
  endDate: string
  label: string
  status: PeriodStatus
}
```

Replace `periodId: string` → `periodCode: string` in: `TimesheetEntry`, `PlannedDay`, `ProfileTaskPeriodStart`, `SnapshotWorkRow`, `Snapshot`.

Replace `periodNumber: number` → `periodCode: string` in: `Snapshot`, `SnapshotWorkRow`, `EmployeeAssignment`.

In `ProjectDetail` / `WorkTableData`: `periods: Period[]` → `periods: PeriodInfo[]`

---

## Task 31 — Frontend: update all period-referencing pages

For each file below, replace `period.id` / `periodId` with `period.code` / `periodCode`, and replace `period.periodNumber` display with `period.label` or `getPeriodLabel(period.code)`.

```
pages/timesheets/approvals-page.tsx
pages/timesheets/timesheets-page.tsx
pages/timesheets/my-timesheets/active-banner.tsx
pages/timesheets/my-timesheets/past-periods.tsx
pages/timesheets/approvals/past-approvals.tsx
pages/timesheets/my-timesheets/types.ts
pages/timesheets/my-timesheets/timesheet-row-mappers.ts
pages/timesheets/approvals/model.ts
pages/timesheets/approvals/types.ts
pages/projects/period-close-wizard.tsx
pages/projects/snapshots-page.tsx
pages/projects/snapshot-detail-page.tsx
pages/projects/project-overview-page.tsx
pages/projects/project-timesheets-page.tsx
pages/projects/work-table-page.tsx
pages/projects/project-timesheets/model.ts
pages/projects/snapshot-detail/work-table-tab.tsx
pages/projects/snapshots/period-row.tsx
pages/projects/snapshots/snapshot-summary-strip.tsx
pages/projects/snapshot-detail/actuals-tab.tsx
pages/projects/snapshots/snapshots-table.tsx
pages/projects/period-close/step4-confirm.tsx
pages/projects/period-close/step1-checklist.tsx
pages/projects/components/period-progress-card.tsx
pages/projects/work-table/view/column-totals-row.tsx
pages/projects/work-table/view/planning-period-zone.tsx
pages/projects/period-close/step2-reforecast.tsx
pages/projects/period-close/step1-plan-actual-table.tsx
pages/projects/components/project-activity-timeline.tsx
pages/projects/work-table/project-work-table.tsx
pages/projects/work-table/view/work-grid-row.tsx
pages/projects/work-table/view/work-grid-header.tsx
pages/projects/work-table/grid-builder.ts
pages/projects/work-table/view/work-cell.tsx
pages/projects/work-table/view/consolidation-table.tsx
pages/projects/work-table/view/work-grid-table.tsx
pages/dashboard/alerts-card.tsx
pages/dashboard/recent-activity-card.tsx
pages/reports/components/utilization-tab.tsx
pages/employees/employee-detail/assignments-card.tsx
```

Also update all hooks in `packages/web/src/api/hooks/index.ts` that pass `periodId` → `periodCode`.

---

## Task 32 — Seed data update

**File:** `packages/db/src/seed.ts`

1. Add `periodGranularity: 'MONTHLY'` to seeded projects
2. Remove all `period` entity creates
3. Add `projectPeriodStatus` rows for the periods that had data (convert `period.id` → `periodCode`, e.g. period 1 of a project starting 2025-01-01 monthly = `2025M1`)
4. Update all `plannedDay`, `timesheetEntry`, `snapshot`, `snapshotWorkRow`, `profileTaskPeriodStart` seed data to use `periodCode` instead of `periodId`

---

## Completion checklist (period migration)

- [x] Task 26 — Schema: drop Period, add ProjectPeriodStatus + periodGranularity + periodCode fields
- [x] Task 27 — Period utility library (API + frontend)
- [x] Task 28 — period-transitions.ts rewrite
- [x] Task 29 — All other API routes updated
- [x] Task 30 — Frontend types updated
- [x] Task 31 — All frontend pages + hooks updated
- [x] Task 32 — Seed data updated
