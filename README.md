# BigDil — PSA Web Application

A Professional Services Automation (PSA) web application for IT consulting companies.

Phase 1 (UI mockups) shipped. Phase 2 is in flight: Prisma + PostgreSQL, Hono API with Zod, real auth + impersonation, Playwright E2E. See `docs/architecture.md` and `docs/data-model.md`.

## Quick Start

```bash
./dev.sh   # boots Postgres (docker compose) + db package + API + web
```

Then open http://localhost:7777 in your browser. API on http://localhost:3000.

<!-- AUTO-GENERATED:SCRIPTS:START -->
## Scripts

Root (`package.json`):

| Command | Description |
|---------|-------------|
| `pnpm dev` | Boot db container + run db/api/web in parallel (concurrently) |
| `pnpm e2e` | Run Playwright E2E suite |
| `pnpm e2e:headed` | Run Playwright E2E in headed browser |

Web (`packages/web`):

| Command | Description |
|---------|-------------|
| `pnpm dev` | Vite dev server (port 7777, strictPort) |
| `pnpm build` | TypeScript build + Vite production build |
| `pnpm lint` | ESLint over `src/` |
| `pnpm preview` | Preview built bundle |
| `pnpm check:component-size` | Fail if any first-party `.tsx` exceeds 150 lines (UI primitives excluded) |

API (`packages/api`):

| Command | Description |
|---------|-------------|
| `pnpm dev` | `tsx watch src/index.ts` (live reload) |
| `pnpm build` | TypeScript compile to `dist/` |
| `pnpm start` | Run compiled `dist/index.js` |

DB (`packages/db`):

| Command | Description |
|---------|-------------|
| `pnpm dev` | `tsc --watch` |
| `pnpm build` | `prisma generate` + `tsc` |
| `pnpm db:push` | Push Prisma schema to Postgres |
| `pnpm db:seed` | Run seed script (`src/seed.ts`) |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm db:generate` | Regenerate Prisma client |
<!-- AUTO-GENERATED:SCRIPTS:END -->

<!-- AUTO-GENERATED:ENV:START -->
## Environment Variables

No `.env.example` shipped — defaults work for local dev with the bundled `docker-compose.yml`.

| Variable | Required | Default | Used by | Description |
|----------|----------|---------|---------|-------------|
| `DATABASE_URL` | No | `postgresql://bigdil:bigdil@localhost:5433/bigdil` | `@bigdil/db` | Postgres connection string |
| `PORT` | No | `3000` | `@bigdil/api` | API HTTP port |
<!-- AUTO-GENERATED:ENV:END -->

## Stack

- **React 19** + **TypeScript 5.9** + **Vite 7**
- **TailwindCSS 4** (CSS-based config, `@tailwindcss/vite` plugin)
- **shadcn/ui** (Radix primitives)
- **react-router v7** (declarative mode, client-side SPA)
- **@tanstack/react-table v8** (data tables)
- **lucide-react** (icons)

## Mock Data

All data is hardcoded in `src/data/mock.ts`. Two projects are simulated:

| Project | Client | Status | Contract Value | Key Feature |
|---------|--------|--------|---------------|-------------|
| ERP Migration | TechVision SA | IN_PROGRESS | 127,750 EUR | 4 closed periods, 1 active, 11 future. Full snapshot history. Change order mid-project. |
| Digital Workplace Rollout | TechVision SA | TO_PLAN | 30,350 EUR | Freshly approved, no dates/periods yet. |

The app is viewed as **Marie Dupont (PM)** by default.

## All Routes

### Auth
| Route | Description |
|-------|-------------|
| `/login` | Login form. Enter anything and click Sign In to proceed. |

### Clients
| Route | Description |
|-------|-------------|
| `/clients` | Client list with aggregated KPIs. |
| `/clients/c1` | TechVision SA detail — Overview + Projects tabs. |

### Reference Data
| Route | Description |
|-------|-------------|
| `/profiles` | Profile list (Senior Consultant, Consultant, etc.) with default rates. New/edit dialog. |
| `/employees` | Employee list. Expand rows to see cost rate history. |

### Projects
| Route | Description |
|-------|-------------|
| `/projects` | Project list with status badges, contract value, margin. |
| `/projects/p1` | **ERP Migration** — IN_PROGRESS. Full KPI strip, lifecycle buttons, tabbed navigation. |
| `/projects/p2` | **Digital Workplace** — TO_PLAN. Estimated KPIs from quote. |

### Project Sub-Pages (use p1 for the richest experience)
| Route | What to Look For |
|-------|-----------------|
| `/projects/p1/overview` | Project details, period progress bar, activity timeline. |
| `/projects/p1/wbs` | Collapsible phase/task tree. Add/edit/archive dialogs. |
| `/projects/p1/quotes` | 2 quotes listed (initial + change order). Click to open detail. |
| `/projects/p1/quotes/q1` | Quote builder with all lines, frozen sell rates, totals panel. |
| `/projects/p1/quotes/q2` | Change order — locked rates matching existing project rates. |
| `/projects/p1/work-table` | **THE WORK TABLE** — The central artifact. Time-phased grid with: closed periods (gray, actuals), active period (blue), future periods (white, editable). Row grouping by Phase > Task > Profile > Employee. Summary columns. Margin insight panel. |
| `/projects/p1/timesheets` | Project timesheet browser with filters and export. |
| `/projects/p1/snapshots` | Period list with snapshot data. Click "Close Period" on W5 (active) to see the 4-step wizard. Click "View" on closed periods. |
| `/projects/p1/snapshots/snap4` | Snapshot detail — Metrics, Scope, Work Table, Actuals tabs. |

### Timesheets
| Route | Description |
|-------|-------------|
| `/timesheets` | Consultant weekly view (simulated as Jean Martin). Active period entries + past history. |
| `/timesheets/approvals` | PM approval queue. Approve/reject submitted timesheets. |

### Admin
| Route | Description |
|-------|-------------|
| `/admin/users` | User management table (8 users, 5 roles). |
| `/admin/settings` | App settings: week config, currency, day precision. |

## Key UX Decisions

1. **Days, not hours** — all quantities are in fractional days (0.25 precision).
2. **Period-driven** — projects are divided into weekly periods. Only one active at a time.
3. **Work Table as central artifact** — spreadsheet-like grid that is both the plan and the execution tracker.
4. **Immutable sell rates** — frozen once at first quote validation for a Task+Profile combination.
5. **Evolving cost rates** — assumption at quote time, refined when employees are assigned, frozen at timesheet approval.
6. **Snapshot-based history** — each period close creates a full-copy immutable snapshot.
7. **PM is the default view** — sidebar shows Projects, Clients, Profiles, Employees, Timesheets, Approvals, Admin.

## Phase 2 — In Progress

- [x] Prisma schema + PostgreSQL (`packages/db`)
- [x] Hono API + Zod validation (`packages/api`) — was Fastify in original plan
- [x] Real data persistence + seed data (`packages/db/src/seed.ts`)
- [x] Auth + impersonation (`/auth`, `/users` routes)
- [x] i18n (en/fr) scaffolding
- [x] Playwright E2E setup (`tests/`, `playwright.config.ts`)
- [x] Docker Compose for Postgres
- [ ] Calculation engine (period close, metrics) — partial
- [ ] Full timesheet lifecycle wiring
