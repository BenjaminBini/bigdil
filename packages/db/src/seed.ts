import { prisma } from './client.js'
import type { PeriodStatus } from '../generated/prisma/enums.js'

// ── Helper: generate periods ───────────────────

function generatePeriods(projectId: string, startDate: string, weeks: number, closedCount = 4) {
  const result: Array<{
    id: string; projectId: string; periodNumber: number;
    startDate: string; endDate: string; status: PeriodStatus; frozenAt: string | null;
  }> = []
  const start = new Date(startDate)
  for (let i = 0; i < weeks; i++) {
    const pStart = new Date(start)
    pStart.setDate(pStart.getDate() + i * 7)
    const pEnd = new Date(pStart)
    pEnd.setDate(pEnd.getDate() + 6)
    let status: PeriodStatus = 'FUTURE'
    let frozenAt: string | null = null
    if (closedCount > 0 && i < closedCount - 1) {
      status = 'FROZEN'
      frozenAt = new Date(pEnd.getTime() + 2 * 86400000).toISOString().split('T')[0]
    } else if (closedCount > 0 && i === closedCount - 1) {
      status = 'CONSOLIDATION'
    } else if (i === closedCount) {
      status = 'OPEN'
    }
    result.push({
      id: `${projectId}-per${i + 1}`,
      projectId,
      periodNumber: i + 1,
      startDate: pStart.toISOString().split('T')[0],
      endDate: pEnd.toISOString().split('T')[0],
      status,
      frozenAt,
    })
  }
  return result
}

async function seed() {
  console.log('Seeding database...')

  // Truncate all tables in reverse dependency order
  await prisma.$executeRaw`
    TRUNCATE snapshot_metrics, snapshot_scope_lines, snapshot_work_rows, snapshots,
             profile_task_period_starts, timesheet_entries, planned_days,
             quote_lines, quotes, periods, tasks, projects,
             employee_cost_rates, users, employees, profiles, clients
    CASCADE
  `

  // ── Clients ──
  await prisma.client.createMany({
    data: [
      { id: 'c1', name: 'TechVision SA', contactName: 'Antoine Lefèvre', contactEmail: 'a.lefevre@techvision.fr', address: '42 Avenue des Champs-Élysées, 75008 Paris' },
    ],
  })

  // ── Profiles ──
  await prisma.profile.createMany({
    data: [
      { id: 'pr1', name: 'Senior Consultant', defaultSellRatePerDay: 1200, defaultCostRatePerDay: 550 },
      { id: 'pr2', name: 'Consultant', defaultSellRatePerDay: 950, defaultCostRatePerDay: 420 },
      { id: 'pr3', name: 'Junior Consultant', defaultSellRatePerDay: 700, defaultCostRatePerDay: 300 },
      { id: 'pr4', name: 'Technical Architect', defaultSellRatePerDay: 1500, defaultCostRatePerDay: 700 },
      { id: 'pr5', name: 'Project Manager', defaultSellRatePerDay: 1100, defaultCostRatePerDay: 520 },
    ],
  })

  // ── Employees ──
  await prisma.employee.createMany({
    data: [
      { id: 'e1', name: 'Jean Martin', active: true, currentCostRatePerDay: 560 },
      { id: 'e2', name: 'Sophie Bernard', active: true, currentCostRatePerDay: 430 },
      { id: 'e3', name: 'Thomas Petit', active: true, currentCostRatePerDay: 310 },
      { id: 'e4', name: 'Paul Girard', active: true, currentCostRatePerDay: 700 },
      { id: 'e5', name: 'Isabelle Faure', active: false, currentCostRatePerDay: 400 },
      { id: 'e6', name: 'Marc Dubois', active: true, currentCostRatePerDay: 540 },
      { id: 'e7', name: 'Camille Lefevre', active: true, currentCostRatePerDay: 410 },
      { id: 'e8', name: 'Lucas Moreau', active: true, currentCostRatePerDay: 390 },
      { id: 'e9', name: 'Emma Garnier', active: true, currentCostRatePerDay: 420 },
      { id: 'e10', name: 'Hugo Blanc', active: true, currentCostRatePerDay: 380 },
    ],
  })

  // ── Employee Cost Rates ──
  await prisma.employeeCostRate.createMany({
    data: [
      { id: 'ecr1', employeeId: 'e1', validFrom: '2024-01-01', validTo: '2025-03-31', costRatePerDay: 520 },
      { id: 'ecr2', employeeId: 'e1', validFrom: '2025-04-01', validTo: null, costRatePerDay: 560 },
      { id: 'ecr3', employeeId: 'e2', validFrom: '2024-01-01', validTo: null, costRatePerDay: 430 },
      { id: 'ecr4', employeeId: 'e3', validFrom: '2024-06-01', validTo: null, costRatePerDay: 310 },
      { id: 'ecr5', employeeId: 'e4', validFrom: '2023-01-01', validTo: null, costRatePerDay: 700 },
      { id: 'ecr6', employeeId: 'e5', validFrom: '2023-01-01', validTo: '2025-09-30', costRatePerDay: 400 },
      { id: 'ecr7', employeeId: 'e6', validFrom: '2024-06-01', validTo: null, costRatePerDay: 540 },
      { id: 'ecr8', employeeId: 'e7', validFrom: '2025-01-01', validTo: null, costRatePerDay: 410 },
      { id: 'ecr9', employeeId: 'e8', validFrom: '2025-03-01', validTo: null, costRatePerDay: 390 },
      { id: 'ecr10', employeeId: 'e9', validFrom: '2024-09-01', validTo: null, costRatePerDay: 420 },
      { id: 'ecr11', employeeId: 'e10', validFrom: '2025-06-01', validTo: null, costRatePerDay: 380 },
    ],
  })

  // ── Users ──
  await prisma.user.createMany({
    data: [
      { id: 'u1', email: 'marie.dupont@acme-consulting.fr', role: 'PM', name: 'Marie Dupont', employeeId: null },
      { id: 'u2', email: 'jean.martin@acme-consulting.fr', role: 'CONSULTANT', name: 'Jean Martin', employeeId: 'e1' },
      { id: 'u3', email: 'sophie.bernard@acme-consulting.fr', role: 'CONSULTANT', name: 'Sophie Bernard', employeeId: 'e2' },
      { id: 'u4', email: 'thomas.petit@acme-consulting.fr', role: 'CONSULTANT', name: 'Thomas Petit', employeeId: 'e3' },
      { id: 'u5', email: 'claire.moreau@acme-consulting.fr', role: 'ADMIN', name: 'Claire Moreau', employeeId: null },
      { id: 'u6', email: 'luc.leroy@acme-consulting.fr', role: 'FINANCE', name: 'Luc Leroy', employeeId: null },
      { id: 'u7', email: 'nathalie.roux@acme-consulting.fr', role: 'EXEC', name: 'Nathalie Roux', employeeId: null },
      { id: 'u8', email: 'paul.girard@acme-consulting.fr', role: 'CONSULTANT', name: 'Paul Girard', employeeId: 'e4' },
    ],
  })

  // ── Projects ──
  await prisma.project.createMany({
    data: [
      { id: 'p1', clientId: 'c1', name: 'ERP Migration', currency: 'EUR', status: 'IN_PROGRESS', startDate: '2026-01-05', endDate: '2026-04-27' },
      { id: 'p2', clientId: 'c1', name: 'Digital Workplace Rollout', currency: 'EUR', status: 'TO_PLAN', startDate: null, endDate: null },
      { id: 'p3', clientId: 'c1', name: 'Cloud Infrastructure Setup', currency: 'EUR', status: 'IN_PROGRESS', startDate: '2026-01-19', endDate: '2026-03-30' },
    ],
  })

  // ── Tasks — Project 1 ──
  await prisma.task.createMany({
    data: [
      { id: 't1', projectId: 'p1', parentTaskId: null, name: 'Phase 1 — Analysis', sortOrder: 1, status: 'done' },
      { id: 't1a', projectId: 'p1', parentTaskId: 't1', name: 'Requirements Gathering', sortOrder: 1, status: 'done' },
      { id: 't1b', projectId: 'p1', parentTaskId: 't1', name: 'Gap Analysis', sortOrder: 2, status: 'done' },
      { id: 't2', projectId: 'p1', parentTaskId: null, name: 'Phase 2 — Design', sortOrder: 2, status: 'active' },
      { id: 't2a', projectId: 'p1', parentTaskId: 't2', name: 'Solution Architecture', sortOrder: 1, status: 'active' },
      { id: 't2b', projectId: 'p1', parentTaskId: 't2', name: 'Data Migration Design', sortOrder: 2, status: 'active' },
      { id: 't2c', projectId: 'p1', parentTaskId: 't2', name: 'Integration Specifications', sortOrder: 3, status: 'planned' },
      { id: 't3', projectId: 'p1', parentTaskId: null, name: 'Phase 3 — Implementation', sortOrder: 3, status: 'planned' },
      { id: 't3a', projectId: 'p1', parentTaskId: 't3', name: 'Core Module Development', sortOrder: 1, status: 'planned' },
      { id: 't3b', projectId: 'p1', parentTaskId: 't3', name: 'Data Migration Execution', sortOrder: 2, status: 'planned' },
      { id: 't3c', projectId: 'p1', parentTaskId: 't3', name: 'Integration Development', sortOrder: 3, status: 'planned' },
      { id: 't4', projectId: 'p1', parentTaskId: null, name: 'Phase 4 — Testing & Go-Live', sortOrder: 4, status: 'planned' },
      { id: 't4a', projectId: 'p1', parentTaskId: 't4', name: 'UAT', sortOrder: 1, status: 'planned' },
      { id: 't4b', projectId: 'p1', parentTaskId: 't4', name: 'Go-Live Support', sortOrder: 2, status: 'planned' },
      { id: 't5', projectId: 'p1', parentTaskId: null, name: 'Project Management', sortOrder: 5, status: 'active' },
    ],
  })

  // ── Tasks — Project 2 ──
  await prisma.task.createMany({
    data: [
      { id: 't2_1', projectId: 'p2', parentTaskId: null, name: 'Phase 1 — Assessment', sortOrder: 1, status: 'planned' },
      { id: 't2_1a', projectId: 'p2', parentTaskId: 't2_1', name: 'Current State Audit', sortOrder: 1, status: 'planned' },
      { id: 't2_1b', projectId: 'p2', parentTaskId: 't2_1', name: 'User Needs Analysis', sortOrder: 2, status: 'planned' },
      { id: 't2_2', projectId: 'p2', parentTaskId: null, name: 'Phase 2 — Deployment', sortOrder: 2, status: 'planned' },
      { id: 't2_2a', projectId: 'p2', parentTaskId: 't2_2', name: 'Platform Configuration', sortOrder: 1, status: 'planned' },
      { id: 't2_2b', projectId: 'p2', parentTaskId: 't2_2', name: 'User Training', sortOrder: 2, status: 'planned' },
      { id: 't2_3', projectId: 'p2', parentTaskId: null, name: 'Project Management', sortOrder: 3, status: 'planned' },
    ],
  })

  // ── Tasks — Project 3 ──
  await prisma.task.createMany({
    data: [
      { id: 't3_1', projectId: 'p3', parentTaskId: null, name: 'Phase 1 — Delivery', sortOrder: 1, status: 'active' },
      { id: 't3_1a', projectId: 'p3', parentTaskId: 't3_1', name: 'Development & Management', sortOrder: 1, status: 'active' },
    ],
  })

  // ── Periods — Project 1 (16 weeks) ──
  const p1Periods = generatePeriods('p1', '2026-01-05', 16)
  await prisma.period.createMany({ data: p1Periods })

  // ── Periods — Project 3 (10 weeks, 5 closed) ──
  const p3Periods = generatePeriods('p3', '2026-01-19', 10, 5)
  await prisma.period.createMany({ data: p3Periods })

  // ── Quotes — Project 1 ──
  await prisma.quote.createMany({
    data: [
      { id: 'q1', projectId: 'p1', title: 'Initial Scope — ERP Migration', status: 'VALIDATED', effectiveAt: '2025-12-15', validatedAt: '2025-12-20' },
      { id: 'q2', projectId: 'p1', title: 'Change Order #1 — Extended Integration', status: 'VALIDATED', effectiveAt: '2026-01-26', validatedAt: '2026-01-28' },
    ],
  })
  await prisma.quoteLine.createMany({
    data: [
      { id: 'ql1', quoteId: 'q1', taskId: 't1a', profileId: 'pr1', days: 5, sellRatePerDay: 1200, costRateAssumptionPerDay: 550, revenueAmount: 6000, budgetCostAmount: 2750 },
      { id: 'ql2', quoteId: 'q1', taskId: 't1b', profileId: 'pr1', days: 5, sellRatePerDay: 1200, costRateAssumptionPerDay: 550, revenueAmount: 6000, budgetCostAmount: 2750 },
      { id: 'ql3', quoteId: 'q1', taskId: 't1b', profileId: 'pr2', days: 3, sellRatePerDay: 950, costRateAssumptionPerDay: 420, revenueAmount: 2850, budgetCostAmount: 1260 },
      { id: 'ql4', quoteId: 'q1', taskId: 't2a', profileId: 'pr4', days: 8, sellRatePerDay: 1500, costRateAssumptionPerDay: 700, revenueAmount: 12000, budgetCostAmount: 5600 },
      { id: 'ql5', quoteId: 'q1', taskId: 't2b', profileId: 'pr1', days: 6, sellRatePerDay: 1200, costRateAssumptionPerDay: 550, revenueAmount: 7200, budgetCostAmount: 3300 },
      { id: 'ql6', quoteId: 'q1', taskId: 't2c', profileId: 'pr2', days: 5, sellRatePerDay: 950, costRateAssumptionPerDay: 420, revenueAmount: 4750, budgetCostAmount: 2100 },
      { id: 'ql7', quoteId: 'q1', taskId: 't3a', profileId: 'pr1', days: 15, sellRatePerDay: 1200, costRateAssumptionPerDay: 550, revenueAmount: 18000, budgetCostAmount: 8250 },
      { id: 'ql8', quoteId: 'q1', taskId: 't3a', profileId: 'pr2', days: 20, sellRatePerDay: 950, costRateAssumptionPerDay: 420, revenueAmount: 19000, budgetCostAmount: 8400 },
      { id: 'ql9', quoteId: 'q1', taskId: 't3b', profileId: 'pr2', days: 10, sellRatePerDay: 950, costRateAssumptionPerDay: 420, revenueAmount: 9500, budgetCostAmount: 4200 },
      { id: 'ql10', quoteId: 'q1', taskId: 't3c', profileId: 'pr1', days: 8, sellRatePerDay: 1200, costRateAssumptionPerDay: 550, revenueAmount: 9600, budgetCostAmount: 4400 },
      { id: 'ql11', quoteId: 'q1', taskId: 't4a', profileId: 'pr2', days: 8, sellRatePerDay: 950, costRateAssumptionPerDay: 420, revenueAmount: 7600, budgetCostAmount: 3360 },
      { id: 'ql12', quoteId: 'q1', taskId: 't4b', profileId: 'pr3', days: 5, sellRatePerDay: 700, costRateAssumptionPerDay: 300, revenueAmount: 3500, budgetCostAmount: 1500 },
      { id: 'ql13', quoteId: 'q1', taskId: 't5', profileId: 'pr5', days: 10, sellRatePerDay: 1100, costRateAssumptionPerDay: 520, revenueAmount: 11000, budgetCostAmount: 5200 },
      // Change Order #1
      { id: 'ql14', quoteId: 'q2', taskId: 't3c', profileId: 'pr1', days: 5, sellRatePerDay: 1200, costRateAssumptionPerDay: 550, revenueAmount: 6000, budgetCostAmount: 2750 },
      { id: 'ql15', quoteId: 'q2', taskId: 't3a', profileId: 'pr2', days: 5, sellRatePerDay: 950, costRateAssumptionPerDay: 420, revenueAmount: 4750, budgetCostAmount: 2100 },
    ],
  })

  // ── Quotes — Project 2 ──
  await prisma.quote.createMany({
    data: [
      { id: 'q3', projectId: 'p2', title: 'Initial Scope — Digital Workplace', status: 'VALIDATED', effectiveAt: '2026-02-20', validatedAt: '2026-02-25' },
    ],
  })
  await prisma.quoteLine.createMany({
    data: [
      { id: 'ql20', quoteId: 'q3', taskId: 't2_1a', profileId: 'pr1', days: 4, sellRatePerDay: 1200, costRateAssumptionPerDay: 550, revenueAmount: 4800, budgetCostAmount: 2200 },
      { id: 'ql21', quoteId: 'q3', taskId: 't2_1b', profileId: 'pr2', days: 5, sellRatePerDay: 950, costRateAssumptionPerDay: 420, revenueAmount: 4750, budgetCostAmount: 2100 },
      { id: 'ql22', quoteId: 'q3', taskId: 't2_2a', profileId: 'pr1', days: 8, sellRatePerDay: 1200, costRateAssumptionPerDay: 550, revenueAmount: 9600, budgetCostAmount: 4400 },
      { id: 'ql23', quoteId: 'q3', taskId: 't2_2b', profileId: 'pr2', days: 6, sellRatePerDay: 950, costRateAssumptionPerDay: 420, revenueAmount: 5700, budgetCostAmount: 2520 },
      { id: 'ql24', quoteId: 'q3', taskId: 't2_3', profileId: 'pr5', days: 5, sellRatePerDay: 1100, costRateAssumptionPerDay: 520, revenueAmount: 5500, budgetCostAmount: 2600 },
    ],
  })

  // ── Quotes — Project 3 ──
  await prisma.quote.createMany({
    data: [
      { id: 'q4', projectId: 'p3', title: 'Initial Scope — Cloud Infrastructure', status: 'VALIDATED', effectiveAt: '2026-01-10', validatedAt: '2026-01-15' },
    ],
  })
  await prisma.quoteLine.createMany({
    data: [
      { id: 'ql30', quoteId: 'q4', taskId: 't3_1a', profileId: 'pr5', days: 10, sellRatePerDay: 1100, costRateAssumptionPerDay: 520, revenueAmount: 11000, budgetCostAmount: 5200 },
      { id: 'ql31', quoteId: 'q4', taskId: 't3_1a', profileId: 'pr2', days: 60, sellRatePerDay: 950, costRateAssumptionPerDay: 420, revenueAmount: 57000, budgetCostAmount: 25200 },
    ],
  })

  // ── Planned Days — Project 1 Work Table ──
  let pdId = 0
  const pd = (taskId: string, profileId: string, employeeId: string | null, periodNum: number, days: number) => {
    pdId++
    return {
      id: `pd${pdId}`, projectId: 'p1', periodId: `p1-per${periodNum}`,
      taskId, profileId, employeeId, days,
    }
  }

  await prisma.plannedDay.createMany({
    data: [
      // Phase 1 Analysis
      pd('t1a', 'pr1', 'e1', 1, 2.5), pd('t1a', 'pr1', 'e1', 2, 2.5),
      pd('t1b', 'pr1', 'e1', 2, 2.5), pd('t1b', 'pr1', 'e1', 3, 2.5),
      pd('t1b', 'pr2', 'e2', 2, 1.5), pd('t1b', 'pr2', 'e2', 3, 1.5),
      // Phase 2 Design
      pd('t2a', 'pr4', 'e4', 3, 2), pd('t2a', 'pr4', 'e4', 4, 2.5),
      pd('t2a', 'pr4', 'e4', 5, 2), pd('t2a', 'pr4', 'e4', 6, 1.5),
      pd('t2b', 'pr1', 'e1', 4, 3), pd('t2b', 'pr1', 'e1', 5, 3),
      pd('t2c', 'pr2', 'e2', 5, 2.5), pd('t2c', 'pr2', 'e2', 6, 2.5),
      // Phase 3 Implementation
      pd('t3a', 'pr1', 'e1', 7, 3), pd('t3a', 'pr1', 'e1', 8, 3),
      pd('t3a', 'pr1', 'e1', 9, 3), pd('t3a', 'pr1', 'e1', 10, 3), pd('t3a', 'pr1', 'e1', 11, 3),
      pd('t3a', 'pr2', 'e2', 7, 4), pd('t3a', 'pr2', 'e2', 8, 4),
      pd('t3a', 'pr2', 'e2', 9, 4), pd('t3a', 'pr2', 'e2', 10, 4), pd('t3a', 'pr2', 'e2', 11, 4),
      pd('t3a', 'pr2', 'e3', 9, 2.5), pd('t3a', 'pr2', 'e3', 10, 2.5),
      pd('t3b', 'pr2', 'e2', 11, 2.5), pd('t3b', 'pr2', 'e2', 12, 4), pd('t3b', 'pr2', 'e2', 13, 3.5),
      pd('t3c', 'pr1', 'e1', 12, 3), pd('t3c', 'pr1', 'e1', 13, 3), pd('t3c', 'pr1', 'e1', 14, 3.5),
      pd('t3c', 'pr1', null, 14, 2), pd('t3c', 'pr1', null, 15, 1.5),
      // Phase 4 Testing
      pd('t4a', 'pr2', 'e2', 14, 3), pd('t4a', 'pr2', 'e2', 15, 3), pd('t4a', 'pr2', 'e2', 16, 2),
      pd('t4b', 'pr3', 'e3', 15, 2.5), pd('t4b', 'pr3', 'e3', 16, 2.5),
      // PM
      pd('t5', 'pr5', null, 1, 0.5), pd('t5', 'pr5', null, 2, 0.5), pd('t5', 'pr5', null, 3, 0.5),
      pd('t5', 'pr5', null, 4, 0.75), pd('t5', 'pr5', null, 5, 0.75), pd('t5', 'pr5', null, 6, 0.75),
      pd('t5', 'pr5', null, 7, 0.75), pd('t5', 'pr5', null, 8, 0.75),
      pd('t5', 'pr5', null, 9, 0.5), pd('t5', 'pr5', null, 10, 0.5), pd('t5', 'pr5', null, 11, 0.5),
      pd('t5', 'pr5', null, 12, 0.5), pd('t5', 'pr5', null, 13, 0.5),
      pd('t5', 'pr5', null, 14, 0.5), pd('t5', 'pr5', null, 15, 0.5), pd('t5', 'pr5', null, 16, 0.5),
    ],
  })

  // ── Planned Days — Project 3 Work Table ──
  let pd3Id = 0
  const pd3 = (taskId: string, profileId: string, employeeId: string | null, periodNum: number, days: number) => {
    pd3Id++
    return {
      id: `pd3_${pd3Id}`, projectId: 'p3', periodId: `p3-per${periodNum}`,
      taskId, profileId, employeeId, days,
    }
  }

  await prisma.plannedDay.createMany({
    data: [
      // PM e6 Marc Dubois
      pd3('t3_1a', 'pr5', 'e6', 1, 0.5), pd3('t3_1a', 'pr5', 'e6', 2, 0.5),
      pd3('t3_1a', 'pr5', 'e6', 3, 1), pd3('t3_1a', 'pr5', 'e6', 4, 1),
      pd3('t3_1a', 'pr5', 'e6', 5, 0.5), pd3('t3_1a', 'pr5', 'e6', 6, 0.5),
      pd3('t3_1a', 'pr5', 'e6', 7, 0.5), pd3('t3_1a', 'pr5', 'e6', 8, 0.5),
      pd3('t3_1a', 'pr5', 'e6', 9, 0.5), pd3('t3_1a', 'pr5', 'e6', 10, 0.5),
      // PM e7 Camille Lefevre
      pd3('t3_1a', 'pr5', 'e7', 1, 0.5), pd3('t3_1a', 'pr5', 'e7', 2, 0.5),
      pd3('t3_1a', 'pr5', 'e7', 3, 0.5), pd3('t3_1a', 'pr5', 'e7', 4, 0.5),
      pd3('t3_1a', 'pr5', 'e7', 5, 0.5), pd3('t3_1a', 'pr5', 'e7', 6, 0.5),
      pd3('t3_1a', 'pr5', 'e7', 7, 0.5), pd3('t3_1a', 'pr5', 'e7', 8, 0.5),
      // Dev e8 Lucas Moreau
      pd3('t3_1a', 'pr2', 'e8', 1, 1), pd3('t3_1a', 'pr2', 'e8', 2, 1.5),
      pd3('t3_1a', 'pr2', 'e8', 3, 1.5), pd3('t3_1a', 'pr2', 'e8', 4, 1.5),
      pd3('t3_1a', 'pr2', 'e8', 5, 1.5), pd3('t3_1a', 'pr2', 'e8', 6, 1.5),
      pd3('t3_1a', 'pr2', 'e8', 7, 1.5), pd3('t3_1a', 'pr2', 'e8', 8, 1.5),
      pd3('t3_1a', 'pr2', 'e8', 9, 1.5), pd3('t3_1a', 'pr2', 'e8', 10, 1),
      // Dev e9 Emma Garnier
      pd3('t3_1a', 'pr2', 'e9', 1, 1), pd3('t3_1a', 'pr2', 'e9', 2, 1.5),
      pd3('t3_1a', 'pr2', 'e9', 3, 1.5), pd3('t3_1a', 'pr2', 'e9', 4, 1.5),
      pd3('t3_1a', 'pr2', 'e9', 5, 1.5), pd3('t3_1a', 'pr2', 'e9', 6, 1.5),
      pd3('t3_1a', 'pr2', 'e9', 7, 1.5), pd3('t3_1a', 'pr2', 'e9', 8, 1.5),
      pd3('t3_1a', 'pr2', 'e9', 9, 1.5), pd3('t3_1a', 'pr2', 'e9', 10, 1),
      // Dev e10 Hugo Blanc
      pd3('t3_1a', 'pr2', 'e10', 1, 1), pd3('t3_1a', 'pr2', 'e10', 2, 1),
      pd3('t3_1a', 'pr2', 'e10', 3, 1.5), pd3('t3_1a', 'pr2', 'e10', 4, 1.5),
      pd3('t3_1a', 'pr2', 'e10', 5, 1), pd3('t3_1a', 'pr2', 'e10', 6, 1.5),
      pd3('t3_1a', 'pr2', 'e10', 7, 1.5), pd3('t3_1a', 'pr2', 'e10', 8, 1.5),
      pd3('t3_1a', 'pr2', 'e10', 9, 1), pd3('t3_1a', 'pr2', 'e10', 10, 0.5),
      // Dev e2 Sophie Bernard
      pd3('t3_1a', 'pr2', 'e2', 2, 1), pd3('t3_1a', 'pr2', 'e2', 3, 1),
      pd3('t3_1a', 'pr2', 'e2', 4, 1.5), pd3('t3_1a', 'pr2', 'e2', 5, 1.5),
      pd3('t3_1a', 'pr2', 'e2', 6, 1), pd3('t3_1a', 'pr2', 'e2', 7, 1),
      pd3('t3_1a', 'pr2', 'e2', 8, 1), pd3('t3_1a', 'pr2', 'e2', 9, 1), pd3('t3_1a', 'pr2', 'e2', 10, 1),
      // Dev e3 Thomas Petit
      pd3('t3_1a', 'pr2', 'e3', 2, 1), pd3('t3_1a', 'pr2', 'e3', 3, 1),
      pd3('t3_1a', 'pr2', 'e3', 4, 1), pd3('t3_1a', 'pr2', 'e3', 5, 1.5),
      pd3('t3_1a', 'pr2', 'e3', 6, 1.5), pd3('t3_1a', 'pr2', 'e3', 7, 1),
      pd3('t3_1a', 'pr2', 'e3', 8, 1), pd3('t3_1a', 'pr2', 'e3', 9, 1), pd3('t3_1a', 'pr2', 'e3', 10, 0.5),
    ],
  })

  // ── Period Start Data — Project 1 ──
  let psId = 0
  const ps = (taskId: string, profileId: string, periodNum: number, remaining: number, sold: number, proj = 'p1') => {
    psId++
    return {
      id: `ps${psId}`, taskId, profileId, periodId: `${proj}-per${periodNum}`,
      remainingAtStart: remaining, soldAtStart: sold,
    }
  }

  await prisma.profileTaskPeriodStart.createMany({
    data: [
      ps('t1a', 'pr1', 5, 0, 5), ps('t1b', 'pr1', 5, 0, 5), ps('t1b', 'pr2', 5, 0, 3),
      ps('t2a', 'pr4', 5, 3.5, 8), ps('t2b', 'pr1', 5, 3, 6), ps('t2c', 'pr2', 5, 5, 5),
      ps('t3a', 'pr1', 5, 15, 15), ps('t3a', 'pr2', 5, 25, 30),
      ps('t3b', 'pr2', 5, 10, 10), ps('t3c', 'pr1', 5, 13, 10),
      ps('t4a', 'pr2', 5, 8, 8), ps('t4b', 'pr3', 5, 5, 5), ps('t5', 'pr5', 5, 7, 8),
      // Project 3
      ps('t3_1a', 'pr5', 6, 4, 10, 'p3'), ps('t3_1a', 'pr2', 6, 30, 60, 'p3'),
    ],
  })

  // ── Timesheets — Project 1 ──
  await prisma.timesheetEntry.createMany({
    data: [
      { id: 'ts1', employeeId: 'e1', projectId: 'p1', periodId: 'p1-per1', taskId: 't1a', profileId: 'pr1', workDate: p1Periods[0].startDate, days: 2.5, status: 'APPROVED', approvedAt: p1Periods[0].frozenAt, appliedCostRatePerDay: 520, appliedCostAmount: 1300, appliedSellRatePerDay: 1200, appliedSellAmount: 3000, notes: '' },
      { id: 'ts2', employeeId: 'e1', projectId: 'p1', periodId: 'p1-per2', taskId: 't1a', profileId: 'pr1', workDate: p1Periods[1].startDate, days: 2.5, status: 'APPROVED', approvedAt: p1Periods[1].frozenAt, appliedCostRatePerDay: 520, appliedCostAmount: 1300, appliedSellRatePerDay: 1200, appliedSellAmount: 3000, notes: '' },
      { id: 'ts3', employeeId: 'e1', projectId: 'p1', periodId: 'p1-per2', taskId: 't1b', profileId: 'pr1', workDate: p1Periods[1].startDate, days: 2.5, status: 'APPROVED', approvedAt: p1Periods[1].frozenAt, appliedCostRatePerDay: 520, appliedCostAmount: 1300, appliedSellRatePerDay: 1200, appliedSellAmount: 3000, notes: '' },
      { id: 'ts4', employeeId: 'e2', projectId: 'p1', periodId: 'p1-per2', taskId: 't1b', profileId: 'pr2', workDate: p1Periods[1].startDate, days: 1.5, status: 'APPROVED', approvedAt: p1Periods[1].frozenAt, appliedCostRatePerDay: 430, appliedCostAmount: 645, appliedSellRatePerDay: 950, appliedSellAmount: 1425, notes: '' },
      { id: 'ts5', employeeId: 'e1', projectId: 'p1', periodId: 'p1-per3', taskId: 't1b', profileId: 'pr1', workDate: p1Periods[2].startDate, days: 2.5, status: 'APPROVED', approvedAt: p1Periods[2].frozenAt, appliedCostRatePerDay: 520, appliedCostAmount: 1300, appliedSellRatePerDay: 1200, appliedSellAmount: 3000, notes: '' },
      { id: 'ts6', employeeId: 'e2', projectId: 'p1', periodId: 'p1-per3', taskId: 't1b', profileId: 'pr2', workDate: p1Periods[2].startDate, days: 1.5, status: 'APPROVED', approvedAt: p1Periods[2].frozenAt, appliedCostRatePerDay: 430, appliedCostAmount: 645, appliedSellRatePerDay: 950, appliedSellAmount: 1425, notes: '' },
      { id: 'ts7', employeeId: 'e4', projectId: 'p1', periodId: 'p1-per3', taskId: 't2a', profileId: 'pr4', workDate: p1Periods[2].startDate, days: 2, status: 'APPROVED', approvedAt: p1Periods[2].frozenAt, appliedCostRatePerDay: 700, appliedCostAmount: 1400, appliedSellRatePerDay: 1500, appliedSellAmount: 3000, notes: '' },
      { id: 'ts8', employeeId: 'e4', projectId: 'p1', periodId: 'p1-per4', taskId: 't2a', profileId: 'pr4', workDate: p1Periods[3].startDate, days: 2.5, status: 'APPROVED', approvedAt: p1Periods[3].frozenAt, appliedCostRatePerDay: 700, appliedCostAmount: 1750, appliedSellRatePerDay: 1500, appliedSellAmount: 3750, notes: '' },
      { id: 'ts9', employeeId: 'e1', projectId: 'p1', periodId: 'p1-per4', taskId: 't2b', profileId: 'pr1', workDate: p1Periods[3].startDate, days: 3, status: 'APPROVED', approvedAt: p1Periods[3].frozenAt, appliedCostRatePerDay: 560, appliedCostAmount: 1680, appliedSellRatePerDay: 1200, appliedSellAmount: 3600, notes: '' },
      // Active period (5) — draft/submitted
      { id: 'ts10', employeeId: 'e4', projectId: 'p1', periodId: 'p1-per5', taskId: 't2a', profileId: 'pr4', workDate: p1Periods[4].startDate, days: 2, status: 'DRAFT', approvedAt: null, appliedCostRatePerDay: null, appliedCostAmount: null, appliedSellRatePerDay: null, appliedSellAmount: null, notes: '' },
      { id: 'ts11', employeeId: 'e1', projectId: 'p1', periodId: 'p1-per5', taskId: 't2b', profileId: 'pr1', workDate: p1Periods[4].startDate, days: 3, status: 'DRAFT', approvedAt: null, appliedCostRatePerDay: null, appliedCostAmount: null, appliedSellRatePerDay: null, appliedSellAmount: null, notes: '' },
      { id: 'ts12', employeeId: 'e2', projectId: 'p1', periodId: 'p1-per5', taskId: 't2c', profileId: 'pr2', workDate: p1Periods[4].startDate, days: 2.5, status: 'SUBMITTED', approvedAt: null, appliedCostRatePerDay: null, appliedCostAmount: null, appliedSellRatePerDay: null, appliedSellAmount: null, notes: 'Completed integration specs draft' },
    ],
  })

  // ── Timesheets — Project 3 ──
  await prisma.timesheetEntry.createMany({
    data: [
      // Period 1
      { id: 'ts3_1', employeeId: 'e6', projectId: 'p3', periodId: 'p3-per1', taskId: 't3_1a', profileId: 'pr5', workDate: p3Periods[0].startDate, days: 0.5, status: 'APPROVED', approvedAt: p3Periods[0].frozenAt, appliedCostRatePerDay: 540, appliedCostAmount: 270, appliedSellRatePerDay: 1100, appliedSellAmount: 550, notes: '' },
      { id: 'ts3_2', employeeId: 'e7', projectId: 'p3', periodId: 'p3-per1', taskId: 't3_1a', profileId: 'pr5', workDate: p3Periods[0].startDate, days: 0.5, status: 'APPROVED', approvedAt: p3Periods[0].frozenAt, appliedCostRatePerDay: 410, appliedCostAmount: 205, appliedSellRatePerDay: 1100, appliedSellAmount: 550, notes: '' },
      { id: 'ts3_3', employeeId: 'e8', projectId: 'p3', periodId: 'p3-per1', taskId: 't3_1a', profileId: 'pr2', workDate: p3Periods[0].startDate, days: 1, status: 'APPROVED', approvedAt: p3Periods[0].frozenAt, appliedCostRatePerDay: 390, appliedCostAmount: 390, appliedSellRatePerDay: 950, appliedSellAmount: 950, notes: '' },
      { id: 'ts3_4', employeeId: 'e9', projectId: 'p3', periodId: 'p3-per1', taskId: 't3_1a', profileId: 'pr2', workDate: p3Periods[0].startDate, days: 1, status: 'APPROVED', approvedAt: p3Periods[0].frozenAt, appliedCostRatePerDay: 420, appliedCostAmount: 420, appliedSellRatePerDay: 950, appliedSellAmount: 950, notes: '' },
      { id: 'ts3_5', employeeId: 'e10', projectId: 'p3', periodId: 'p3-per1', taskId: 't3_1a', profileId: 'pr2', workDate: p3Periods[0].startDate, days: 1, status: 'APPROVED', approvedAt: p3Periods[0].frozenAt, appliedCostRatePerDay: 380, appliedCostAmount: 380, appliedSellRatePerDay: 950, appliedSellAmount: 950, notes: '' },
      // Period 2
      { id: 'ts3_6', employeeId: 'e6', projectId: 'p3', periodId: 'p3-per2', taskId: 't3_1a', profileId: 'pr5', workDate: p3Periods[1].startDate, days: 0.5, status: 'APPROVED', approvedAt: p3Periods[1].frozenAt, appliedCostRatePerDay: 540, appliedCostAmount: 270, appliedSellRatePerDay: 1100, appliedSellAmount: 550, notes: '' },
      { id: 'ts3_7', employeeId: 'e7', projectId: 'p3', periodId: 'p3-per2', taskId: 't3_1a', profileId: 'pr5', workDate: p3Periods[1].startDate, days: 0.5, status: 'APPROVED', approvedAt: p3Periods[1].frozenAt, appliedCostRatePerDay: 410, appliedCostAmount: 205, appliedSellRatePerDay: 1100, appliedSellAmount: 550, notes: '' },
      { id: 'ts3_8', employeeId: 'e8', projectId: 'p3', periodId: 'p3-per2', taskId: 't3_1a', profileId: 'pr2', workDate: p3Periods[1].startDate, days: 1.5, status: 'APPROVED', approvedAt: p3Periods[1].frozenAt, appliedCostRatePerDay: 390, appliedCostAmount: 585, appliedSellRatePerDay: 950, appliedSellAmount: 1425, notes: '' },
      { id: 'ts3_9', employeeId: 'e9', projectId: 'p3', periodId: 'p3-per2', taskId: 't3_1a', profileId: 'pr2', workDate: p3Periods[1].startDate, days: 1.5, status: 'APPROVED', approvedAt: p3Periods[1].frozenAt, appliedCostRatePerDay: 420, appliedCostAmount: 630, appliedSellRatePerDay: 950, appliedSellAmount: 1425, notes: '' },
      { id: 'ts3_10', employeeId: 'e10', projectId: 'p3', periodId: 'p3-per2', taskId: 't3_1a', profileId: 'pr2', workDate: p3Periods[1].startDate, days: 1, status: 'APPROVED', approvedAt: p3Periods[1].frozenAt, appliedCostRatePerDay: 380, appliedCostAmount: 380, appliedSellRatePerDay: 950, appliedSellAmount: 950, notes: '' },
      { id: 'ts3_11', employeeId: 'e2', projectId: 'p3', periodId: 'p3-per2', taskId: 't3_1a', profileId: 'pr2', workDate: p3Periods[1].startDate, days: 1, status: 'APPROVED', approvedAt: p3Periods[1].frozenAt, appliedCostRatePerDay: 430, appliedCostAmount: 430, appliedSellRatePerDay: 950, appliedSellAmount: 950, notes: '' },
      { id: 'ts3_12', employeeId: 'e3', projectId: 'p3', periodId: 'p3-per2', taskId: 't3_1a', profileId: 'pr2', workDate: p3Periods[1].startDate, days: 1, status: 'APPROVED', approvedAt: p3Periods[1].frozenAt, appliedCostRatePerDay: 310, appliedCostAmount: 310, appliedSellRatePerDay: 950, appliedSellAmount: 950, notes: '' },
      // Period 3
      { id: 'ts3_13', employeeId: 'e6', projectId: 'p3', periodId: 'p3-per3', taskId: 't3_1a', profileId: 'pr5', workDate: p3Periods[2].startDate, days: 1, status: 'APPROVED', approvedAt: p3Periods[2].frozenAt, appliedCostRatePerDay: 540, appliedCostAmount: 540, appliedSellRatePerDay: 1100, appliedSellAmount: 1100, notes: '' },
      { id: 'ts3_14', employeeId: 'e7', projectId: 'p3', periodId: 'p3-per3', taskId: 't3_1a', profileId: 'pr5', workDate: p3Periods[2].startDate, days: 0.5, status: 'APPROVED', approvedAt: p3Periods[2].frozenAt, appliedCostRatePerDay: 410, appliedCostAmount: 205, appliedSellRatePerDay: 1100, appliedSellAmount: 550, notes: '' },
      { id: 'ts3_15', employeeId: 'e8', projectId: 'p3', periodId: 'p3-per3', taskId: 't3_1a', profileId: 'pr2', workDate: p3Periods[2].startDate, days: 1.5, status: 'APPROVED', approvedAt: p3Periods[2].frozenAt, appliedCostRatePerDay: 390, appliedCostAmount: 585, appliedSellRatePerDay: 950, appliedSellAmount: 1425, notes: '' },
      { id: 'ts3_16', employeeId: 'e9', projectId: 'p3', periodId: 'p3-per3', taskId: 't3_1a', profileId: 'pr2', workDate: p3Periods[2].startDate, days: 1.5, status: 'APPROVED', approvedAt: p3Periods[2].frozenAt, appliedCostRatePerDay: 420, appliedCostAmount: 630, appliedSellRatePerDay: 950, appliedSellAmount: 1425, notes: '' },
      { id: 'ts3_17', employeeId: 'e10', projectId: 'p3', periodId: 'p3-per3', taskId: 't3_1a', profileId: 'pr2', workDate: p3Periods[2].startDate, days: 1.5, status: 'APPROVED', approvedAt: p3Periods[2].frozenAt, appliedCostRatePerDay: 380, appliedCostAmount: 570, appliedSellRatePerDay: 950, appliedSellAmount: 1425, notes: '' },
      { id: 'ts3_18', employeeId: 'e2', projectId: 'p3', periodId: 'p3-per3', taskId: 't3_1a', profileId: 'pr2', workDate: p3Periods[2].startDate, days: 1, status: 'APPROVED', approvedAt: p3Periods[2].frozenAt, appliedCostRatePerDay: 430, appliedCostAmount: 430, appliedSellRatePerDay: 950, appliedSellAmount: 950, notes: '' },
      { id: 'ts3_19', employeeId: 'e3', projectId: 'p3', periodId: 'p3-per3', taskId: 't3_1a', profileId: 'pr2', workDate: p3Periods[2].startDate, days: 1, status: 'APPROVED', approvedAt: p3Periods[2].frozenAt, appliedCostRatePerDay: 310, appliedCostAmount: 310, appliedSellRatePerDay: 950, appliedSellAmount: 950, notes: '' },
      // Period 4
      { id: 'ts3_20', employeeId: 'e6', projectId: 'p3', periodId: 'p3-per4', taskId: 't3_1a', profileId: 'pr5', workDate: p3Periods[3].startDate, days: 1, status: 'APPROVED', approvedAt: p3Periods[3].frozenAt, appliedCostRatePerDay: 540, appliedCostAmount: 540, appliedSellRatePerDay: 1100, appliedSellAmount: 1100, notes: '' },
      { id: 'ts3_21', employeeId: 'e7', projectId: 'p3', periodId: 'p3-per4', taskId: 't3_1a', profileId: 'pr5', workDate: p3Periods[3].startDate, days: 0.5, status: 'APPROVED', approvedAt: p3Periods[3].frozenAt, appliedCostRatePerDay: 410, appliedCostAmount: 205, appliedSellRatePerDay: 1100, appliedSellAmount: 550, notes: '' },
      { id: 'ts3_22', employeeId: 'e8', projectId: 'p3', periodId: 'p3-per4', taskId: 't3_1a', profileId: 'pr2', workDate: p3Periods[3].startDate, days: 1.5, status: 'APPROVED', approvedAt: p3Periods[3].frozenAt, appliedCostRatePerDay: 390, appliedCostAmount: 585, appliedSellRatePerDay: 950, appliedSellAmount: 1425, notes: '' },
      { id: 'ts3_23', employeeId: 'e9', projectId: 'p3', periodId: 'p3-per4', taskId: 't3_1a', profileId: 'pr2', workDate: p3Periods[3].startDate, days: 1.5, status: 'APPROVED', approvedAt: p3Periods[3].frozenAt, appliedCostRatePerDay: 420, appliedCostAmount: 630, appliedSellRatePerDay: 950, appliedSellAmount: 1425, notes: '' },
      { id: 'ts3_24', employeeId: 'e10', projectId: 'p3', periodId: 'p3-per4', taskId: 't3_1a', profileId: 'pr2', workDate: p3Periods[3].startDate, days: 1.5, status: 'APPROVED', approvedAt: p3Periods[3].frozenAt, appliedCostRatePerDay: 380, appliedCostAmount: 570, appliedSellRatePerDay: 950, appliedSellAmount: 1425, notes: '' },
      { id: 'ts3_25', employeeId: 'e2', projectId: 'p3', periodId: 'p3-per4', taskId: 't3_1a', profileId: 'pr2', workDate: p3Periods[3].startDate, days: 1.5, status: 'APPROVED', approvedAt: p3Periods[3].frozenAt, appliedCostRatePerDay: 430, appliedCostAmount: 645, appliedSellRatePerDay: 950, appliedSellAmount: 1425, notes: '' },
      { id: 'ts3_26', employeeId: 'e3', projectId: 'p3', periodId: 'p3-per4', taskId: 't3_1a', profileId: 'pr2', workDate: p3Periods[3].startDate, days: 1, status: 'APPROVED', approvedAt: p3Periods[3].frozenAt, appliedCostRatePerDay: 310, appliedCostAmount: 310, appliedSellRatePerDay: 950, appliedSellAmount: 950, notes: '' },
      // Period 5
      { id: 'ts3_27', employeeId: 'e6', projectId: 'p3', periodId: 'p3-per5', taskId: 't3_1a', profileId: 'pr5', workDate: p3Periods[4].startDate, days: 0.5, status: 'APPROVED', approvedAt: p3Periods[4].frozenAt, appliedCostRatePerDay: 540, appliedCostAmount: 270, appliedSellRatePerDay: 1100, appliedSellAmount: 550, notes: '' },
      { id: 'ts3_28', employeeId: 'e7', projectId: 'p3', periodId: 'p3-per5', taskId: 't3_1a', profileId: 'pr5', workDate: p3Periods[4].startDate, days: 0.5, status: 'APPROVED', approvedAt: p3Periods[4].frozenAt, appliedCostRatePerDay: 410, appliedCostAmount: 205, appliedSellRatePerDay: 1100, appliedSellAmount: 550, notes: '' },
      { id: 'ts3_29', employeeId: 'e8', projectId: 'p3', periodId: 'p3-per5', taskId: 't3_1a', profileId: 'pr2', workDate: p3Periods[4].startDate, days: 1.5, status: 'APPROVED', approvedAt: p3Periods[4].frozenAt, appliedCostRatePerDay: 390, appliedCostAmount: 585, appliedSellRatePerDay: 950, appliedSellAmount: 1425, notes: '' },
      { id: 'ts3_30', employeeId: 'e9', projectId: 'p3', periodId: 'p3-per5', taskId: 't3_1a', profileId: 'pr2', workDate: p3Periods[4].startDate, days: 1.5, status: 'APPROVED', approvedAt: p3Periods[4].frozenAt, appliedCostRatePerDay: 420, appliedCostAmount: 630, appliedSellRatePerDay: 950, appliedSellAmount: 1425, notes: '' },
      { id: 'ts3_31', employeeId: 'e10', projectId: 'p3', periodId: 'p3-per5', taskId: 't3_1a', profileId: 'pr2', workDate: p3Periods[4].startDate, days: 1, status: 'APPROVED', approvedAt: p3Periods[4].frozenAt, appliedCostRatePerDay: 380, appliedCostAmount: 380, appliedSellRatePerDay: 950, appliedSellAmount: 950, notes: '' },
      { id: 'ts3_32', employeeId: 'e2', projectId: 'p3', periodId: 'p3-per5', taskId: 't3_1a', profileId: 'pr2', workDate: p3Periods[4].startDate, days: 1.5, status: 'APPROVED', approvedAt: p3Periods[4].frozenAt, appliedCostRatePerDay: 430, appliedCostAmount: 645, appliedSellRatePerDay: 950, appliedSellAmount: 1425, notes: '' },
      { id: 'ts3_33', employeeId: 'e3', projectId: 'p3', periodId: 'p3-per5', taskId: 't3_1a', profileId: 'pr2', workDate: p3Periods[4].startDate, days: 1.5, status: 'APPROVED', approvedAt: p3Periods[4].frozenAt, appliedCostRatePerDay: 310, appliedCostAmount: 465, appliedSellRatePerDay: 950, appliedSellAmount: 1425, notes: '' },
      // Period 6 (ACTIVE)
      { id: 'ts3_34', employeeId: 'e6', projectId: 'p3', periodId: 'p3-per6', taskId: 't3_1a', profileId: 'pr5', workDate: p3Periods[5].startDate, days: 0.5, status: 'DRAFT', approvedAt: null, appliedCostRatePerDay: null, appliedCostAmount: null, appliedSellRatePerDay: null, appliedSellAmount: null, notes: '' },
      { id: 'ts3_35', employeeId: 'e8', projectId: 'p3', periodId: 'p3-per6', taskId: 't3_1a', profileId: 'pr2', workDate: p3Periods[5].startDate, days: 1.5, status: 'SUBMITTED', approvedAt: null, appliedCostRatePerDay: null, appliedCostAmount: null, appliedSellRatePerDay: null, appliedSellAmount: null, notes: 'Sprint 6 dev work' },
      { id: 'ts3_36', employeeId: 'e9', projectId: 'p3', periodId: 'p3-per6', taskId: 't3_1a', profileId: 'pr2', workDate: p3Periods[5].startDate, days: 1.5, status: 'DRAFT', approvedAt: null, appliedCostRatePerDay: null, appliedCostAmount: null, appliedSellRatePerDay: null, appliedSellAmount: null, notes: '' },
    ],
  })

  // ── Snapshots — Project 1 ──
  await prisma.snapshot.createMany({
    data: [
      { id: 'snap1', projectId: 'p1', periodId: 'p1-per1', periodNumber: 1, snapshotAt: '2026-01-13', frozenAt: '2026-01-13', closedBy: 'u1', notes: 'Period 1 closed — analysis on track' },
      { id: 'snap2', projectId: 'p1', periodId: 'p1-per2', periodNumber: 2, snapshotAt: '2026-01-20', frozenAt: '2026-01-20', closedBy: 'u1', notes: 'Period 2 closed — requirements complete' },
      { id: 'snap3', projectId: 'p1', periodId: 'p1-per3', periodNumber: 3, snapshotAt: '2026-01-27', frozenAt: '2026-01-27', closedBy: 'u1', notes: 'Period 3 closed — change order #1 validated, integration scope expanded' },
      { id: 'snap4', projectId: 'p1', periodId: 'p1-per4', periodNumber: 4, snapshotAt: '2026-02-03', frozenAt: '2026-02-03', closedBy: 'u1', notes: 'Period 4 closed — design phase progressing, cost rate for Jean updated' },
    ],
  })
  await prisma.snapshotMetrics.createMany({
    data: [
      { snapshotId: 'snap1', contractValue: 117000, actualCostToDate: 1300, etcCost: 51920, eacCost: 53220, marginForecast: 63780, executedDaysPeriod: 3, producedExecutionValuePeriod: 3600, producedExecutionValueToDate: 3600, netBurnValuePeriod: 3600 },
      { snapshotId: 'snap2', contractValue: 117000, actualCostToDate: 5565, etcCost: 49170, eacCost: 54735, marginForecast: 62265, executedDaysPeriod: 7, producedExecutionValuePeriod: 8050, producedExecutionValueToDate: 11650, netBurnValuePeriod: 8050 },
      { snapshotId: 'snap3', contractValue: 127750, actualCostToDate: 8710, etcCost: 52250, eacCost: 60960, marginForecast: 66790, executedDaysPeriod: 6, producedExecutionValuePeriod: 6425, producedExecutionValueToDate: 18075, netBurnValuePeriod: 6425 },
      { snapshotId: 'snap4', contractValue: 127750, actualCostToDate: 12680, etcCost: 49810, eacCost: 62490, marginForecast: 65260, executedDaysPeriod: 5.5, producedExecutionValuePeriod: 7350, producedExecutionValueToDate: 25425, netBurnValuePeriod: 7350 },
    ],
  })

  // ── Snapshots — Project 3 ──
  await prisma.snapshot.createMany({
    data: [
      { id: 'snap3_1', projectId: 'p3', periodId: 'p3-per1', periodNumber: 1, snapshotAt: '2026-01-27', frozenAt: '2026-01-27', closedBy: 'u1', notes: 'Period 1 closed — project kicked off' },
      { id: 'snap3_2', projectId: 'p3', periodId: 'p3-per2', periodNumber: 2, snapshotAt: '2026-02-03', frozenAt: '2026-02-03', closedBy: 'u1', notes: 'Period 2 closed — full team onboarded' },
      { id: 'snap3_3', projectId: 'p3', periodId: 'p3-per3', periodNumber: 3, snapshotAt: '2026-02-10', frozenAt: '2026-02-10', closedBy: 'u1', notes: 'Period 3 closed — development progressing well' },
      { id: 'snap3_4', projectId: 'p3', periodId: 'p3-per4', periodNumber: 4, snapshotAt: '2026-02-17', frozenAt: '2026-02-17', closedBy: 'u1', notes: 'Period 4 closed — on track, peak velocity' },
      { id: 'snap3_5', projectId: 'p3', periodId: 'p3-per5', periodNumber: 5, snapshotAt: '2026-02-24', frozenAt: '2026-02-24', closedBy: 'u1', notes: 'Period 5 closed — halfway through project' },
    ],
  })
  await prisma.snapshotMetrics.createMany({
    data: [
      { snapshotId: 'snap3_1', contractValue: 68000, actualCostToDate: 1665, etcCost: 27550, eacCost: 29215, marginForecast: 38785, executedDaysPeriod: 4, producedExecutionValuePeriod: 3950, producedExecutionValueToDate: 3950, netBurnValuePeriod: 3950 },
      { snapshotId: 'snap3_2', contractValue: 68000, actualCostToDate: 4475, etcCost: 24630, eacCost: 29105, marginForecast: 38895, executedDaysPeriod: 7, producedExecutionValuePeriod: 6800, producedExecutionValueToDate: 10750, netBurnValuePeriod: 6800 },
      { snapshotId: 'snap3_3', contractValue: 68000, actualCostToDate: 7745, etcCost: 21250, eacCost: 28995, marginForecast: 39005, executedDaysPeriod: 8, producedExecutionValuePeriod: 7825, producedExecutionValueToDate: 18575, netBurnValuePeriod: 7825 },
      { snapshotId: 'snap3_4', contractValue: 68000, actualCostToDate: 11230, etcCost: 17675, eacCost: 28905, marginForecast: 39095, executedDaysPeriod: 8.5, producedExecutionValuePeriod: 8300, producedExecutionValueToDate: 26875, netBurnValuePeriod: 8300 },
      { snapshotId: 'snap3_5', contractValue: 68000, actualCostToDate: 14410, etcCost: 13770, eacCost: 28180, marginForecast: 39820, executedDaysPeriod: 8, producedExecutionValuePeriod: 7750, producedExecutionValueToDate: 34625, netBurnValuePeriod: 7750 },
    ],
  })

  console.log('Seed complete!')
  await prisma.$disconnect()
  process.exit(0)
}

seed().catch(async (err) => {
  console.error('Seed failed:', err)
  await prisma.$disconnect()
  process.exit(1)
})
