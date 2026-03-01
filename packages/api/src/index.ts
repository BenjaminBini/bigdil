import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { projectsRouter } from './routes/projects.js'
import { referenceDataRouter } from './routes/reference-data.js'
import { timesheetsRouter } from './routes/timesheets.js'
import { dashboardRouter } from './routes/dashboard.js'
import { employeesRouter } from './routes/employees.js'
import { profilesRouter } from './routes/profiles.js'
import { reportsRouter } from './routes/reports.js'
import { workTableMutationsRouter } from './routes/work-table-mutations.js'
import { timesheetMutationsRouter } from './routes/timesheet-mutations.js'
import { periodTransitionsRouter } from './routes/period-transitions.js'

const app = new Hono()

// ── Middleware ──
app.use('*', logger())
app.use('*', cors({
  origin: ['http://localhost:5173', 'http://localhost:4173'],
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowHeaders: ['Content-Type'],
}))

// ── Health check ──
app.get('/health', (c) => c.json({ status: 'ok' }))

// ── Routes ──
app.route('/api/dashboard', dashboardRouter)
app.route('/api/projects', projectsRouter)
app.route('/api/timesheets', timesheetsRouter)
app.route('/api/reference-data', referenceDataRouter)
app.route('/api/employees', employeesRouter)
app.route('/api/profiles', profilesRouter)
app.route('/api/reports', reportsRouter)
app.route('/api/projects', workTableMutationsRouter)
app.route('/api/timesheets', timesheetMutationsRouter)
app.route('/api/projects', periodTransitionsRouter)

// ── Error handling ──
app.onError((err, c) => {
  const status = (err as { status?: number }).status
  if (status && status >= 400 && status < 500) {
    return c.json({ error: err.message }, status as 400 | 404)
  }
  console.error('Unhandled error:', err)
  return c.json({ error: 'Internal server error' }, 500)
})

app.notFound((c) => c.json({ error: 'Not found' }, 404))

// ── Start ──
const port = Number(process.env.PORT) || 3000
console.log(`API server starting on port ${port}`)
serve({ fetch: app.fetch, port })
