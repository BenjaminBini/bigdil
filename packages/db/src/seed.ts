import { prisma } from './client.js'

// ── Minimal dev seed (post-refactor) ──
// One client / project / task / quote, plus admin user, employee, profile,
// an assignment slot, planned days for OPEN week, a DRAFT Timesheet for that
// week with one TaskTimesheet, and the global timesheet window pointing at
// 2026M5__2026W19.

const MONTH = '2026M5'
const OPEN_WEEK = '2026W19'
const OPEN_PERIOD_KEY = `${MONTH}__${OPEN_WEEK}`

async function reset() {
  // FK-safe order: leaves first, roots last.
  await prisma.auditLog.deleteMany()
  await prisma.snapshotMetrics.deleteMany()
  await prisma.snapshotWorkRow.deleteMany()
  await prisma.snapshotScopeLine.deleteMany()
  await prisma.snapshot.deleteMany()
  await prisma.monthFreeze.deleteMany()
  await prisma.taskTimesheet.deleteMany()
  await prisma.timesheet.deleteMany()
  await prisma.plannedDay.deleteMany()
  await prisma.assignmentSlot.deleteMany()
  await prisma.profileTaskPeriodStart.deleteMany()
  await prisma.quoteLine.deleteMany()
  await prisma.quote.deleteMany()
  await prisma.task.deleteMany()
  await prisma.phase.deleteMany()
  await prisma.project.deleteMany()
  await prisma.employeeCostRate.deleteMany()
  // User → Employee FK is nullable, but break the link first to be safe.
  await prisma.user.updateMany({ data: { employeeId: null } })
  await prisma.user.deleteMany()
  await prisma.employee.deleteMany()
  await prisma.profile.deleteMany()
  await prisma.client.deleteMany()
  await prisma.globalTimesheetWindow.deleteMany()
}

async function main() {
  await reset()

  const client = await prisma.client.create({
    data: {
      name: 'Acme Corp',
      contactName: 'Jane Doe',
      contactEmail: 'jane@acme.test',
      addressLine1: '1 Rue de la Paix',
      postalCode: '75002',
      city: 'Paris',
      country: 'FR',
    },
  })

  const profile = await prisma.profile.create({
    data: {
      name: 'Senior Consultant',
      defaultSellRatePerDay: 1200,
      defaultCostRatePerDay: 600,
    },
  })

  const employee = await prisma.employee.create({
    data: {
      name: 'Alice Martin',
      active: true,
      currentCostRatePerDay: 600,
      costRates: {
        create: {
          validFrom: new Date('2026-01-01'),
          costRatePerDay: 600,
        },
      },
    },
  })

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@bigdil.test',
      role: 'ADMIN',
      name: 'Admin User',
      employeeId: employee.id,
    },
  })

  const project = await prisma.project.create({
    data: {
      clientId: client.id,
      name: 'Acme Migration',
      currency: 'EUR',
      startDate: new Date('2026-04-01'),
      endDate: new Date('2026-08-31'),
    },
  })

  const phase = await prisma.phase.create({
    data: {
      projectId: project.id,
      name: 'Discovery phase',
      sortOrder: 1,
    },
  })

  const task = await prisma.task.create({
    data: {
      phaseId: phase.id,
      name: 'Initial workshops',
      sortOrder: 1,
      status: 'active',
    },
  })

  const quote = await prisma.quote.create({
    data: {
      projectId: project.id,
      title: 'Acme Migration — Phase 1',
      status: 'VALIDATED',
      sentAt: new Date('2026-03-25'),
      effectiveAt: new Date('2026-04-01'),
      validatedAt: new Date('2026-04-01'),
    },
  })

  await prisma.quoteLine.create({
    data: {
      quoteId: quote.id,
      taskId: task.id,
      profileId: profile.id,
      days: 20,
      sellRatePerDay: 1200,
      costRateAssumptionPerDay: 600,
      revenueAmount: 24000,
      budgetCostAmount: 12000,
    },
  })

  await prisma.profileTaskPeriodStart.create({
    data: {
      taskId: task.id,
      profileId: profile.id,
      periodKey: MONTH,
      remainingAtStart: 10,
      soldAtStart: 20,
    },
  })

  const slot = await prisma.assignmentSlot.create({
    data: {
      projectId: project.id,
      taskId: task.id,
      profileId: profile.id,
      employeeId: employee.id,
    },
  })

  await prisma.plannedDay.create({
    data: {
      assignmentSlotId: slot.id,
      periodKey: OPEN_PERIOD_KEY,
      days: 10,
    },
  })

  const timesheet = await prisma.timesheet.create({
    data: {
      employeeId: employee.id,
      periodKey: OPEN_PERIOD_KEY,
      status: 'DRAFT',
    },
  })

  await prisma.taskTimesheet.create({
    data: {
      timesheetId: timesheet.id,
      assignmentSlotId: slot.id,
      workDate: new Date('2026-05-05'),
      days: 1,
    },
  })

  // ── Second project: Nimbus Platform Rebuild ─────────────────────────────
  // Richer fixture: multiple phases (Discovery, Build, Launch), multiple
  // tasks per phase, multiple profiles, multiple employees, a SENT quote
  // (under client review) and a VALIDATED quote (contractual baseline),
  // assignments and planned days spanning several weeks.

  const clientNimbus = await prisma.client.create({
    data: {
      name: 'Nimbus Industries',
      contactName: 'Marc Lefèvre',
      contactEmail: 'marc.lefevre@nimbus.test',
      addressLine1: '42 Avenue de la République',
      postalCode: '69003',
      city: 'Lyon',
      country: 'FR',
    },
  })

  const profileTechLead = await prisma.profile.create({
    data: { name: 'Tech Lead', defaultSellRatePerDay: 1400, defaultCostRatePerDay: 750 },
  })
  const profileDev = await prisma.profile.create({
    data: { name: 'Developer', defaultSellRatePerDay: 950, defaultCostRatePerDay: 480 },
  })
  const profilePM = await prisma.profile.create({
    data: { name: 'Project Manager', defaultSellRatePerDay: 1100, defaultCostRatePerDay: 580 },
  })

  const empBob = await prisma.employee.create({
    data: {
      name: 'Bob Durand',
      active: true,
      currentCostRatePerDay: 750,
      costRates: { create: { validFrom: new Date('2026-01-01'), costRatePerDay: 750 } },
    },
  })
  const empClara = await prisma.employee.create({
    data: {
      name: 'Clara Nguyen',
      active: true,
      currentCostRatePerDay: 480,
      costRates: { create: { validFrom: new Date('2026-01-01'), costRatePerDay: 480 } },
    },
  })
  const empDaniel = await prisma.employee.create({
    data: {
      name: 'Daniel Rossi',
      active: true,
      currentCostRatePerDay: 580,
      costRates: { create: { validFrom: new Date('2026-01-01'), costRatePerDay: 580 } },
    },
  })

  const projectNimbus = await prisma.project.create({
    data: {
      clientId: clientNimbus.id,
      name: 'Nimbus Platform Rebuild',
      currency: 'EUR',
      startDate: new Date('2026-03-01'),
      endDate: new Date('2026-10-31'),
    },
  })

  const phaseDiscovery = await prisma.phase.create({
    data: { projectId: projectNimbus.id, name: 'Discovery', sortOrder: 1 },
  })
  const phaseBuild = await prisma.phase.create({
    data: { projectId: projectNimbus.id, name: 'Build', sortOrder: 2 },
  })
  const phaseLaunch = await prisma.phase.create({
    data: { projectId: projectNimbus.id, name: 'Launch', sortOrder: 3 },
  })

  const tDiscWorkshops = await prisma.task.create({
    data: { phaseId: phaseDiscovery.id, name: 'Stakeholder workshops', sortOrder: 1, status: 'done' },
  })
  const tDiscArch = await prisma.task.create({
    data: { phaseId: phaseDiscovery.id, name: 'Target architecture', sortOrder: 2, status: 'active' },
  })
  const tBuildApi = await prisma.task.create({
    data: { phaseId: phaseBuild.id, name: 'API platform', sortOrder: 1, status: 'active' },
  })
  const tBuildFront = await prisma.task.create({
    data: { phaseId: phaseBuild.id, name: 'Web frontend', sortOrder: 2, status: 'planned' },
  })
  const tBuildData = await prisma.task.create({
    data: { phaseId: phaseBuild.id, name: 'Data migration', sortOrder: 3, status: 'planned' },
  })
  const tLaunchUat = await prisma.task.create({
    data: { phaseId: phaseLaunch.id, name: 'UAT & training', sortOrder: 1, status: 'planned' },
  })
  const tLaunchCutover = await prisma.task.create({
    data: { phaseId: phaseLaunch.id, name: 'Production cutover', sortOrder: 2, status: 'planned' },
  })

  // VALIDATED baseline quote — contractual reference.
  const quoteBaseline = await prisma.quote.create({
    data: {
      projectId: projectNimbus.id,
      title: 'Nimbus Rebuild — Baseline',
      status: 'VALIDATED',
      sentAt: new Date('2026-02-20'),
      effectiveAt: new Date('2026-03-01'),
      validatedAt: new Date('2026-02-28'),
    },
  })

  await prisma.quoteLine.createMany({
    data: [
      { quoteId: quoteBaseline.id, taskId: tDiscWorkshops.id, profileId: profilePM.id, days: 8, sellRatePerDay: 1100, costRateAssumptionPerDay: 580, revenueAmount: 8800, budgetCostAmount: 4640 },
      { quoteId: quoteBaseline.id, taskId: tDiscArch.id, profileId: profileTechLead.id, days: 12, sellRatePerDay: 1400, costRateAssumptionPerDay: 750, revenueAmount: 16800, budgetCostAmount: 9000 },
      { quoteId: quoteBaseline.id, taskId: tBuildApi.id, profileId: profileTechLead.id, days: 25, sellRatePerDay: 1400, costRateAssumptionPerDay: 750, revenueAmount: 35000, budgetCostAmount: 18750 },
      { quoteId: quoteBaseline.id, taskId: tBuildApi.id, profileId: profileDev.id, days: 60, sellRatePerDay: 950, costRateAssumptionPerDay: 480, revenueAmount: 57000, budgetCostAmount: 28800 },
      { quoteId: quoteBaseline.id, taskId: tBuildFront.id, profileId: profileDev.id, days: 45, sellRatePerDay: 950, costRateAssumptionPerDay: 480, revenueAmount: 42750, budgetCostAmount: 21600 },
      { quoteId: quoteBaseline.id, taskId: tBuildData.id, profileId: profileDev.id, days: 20, sellRatePerDay: 950, costRateAssumptionPerDay: 480, revenueAmount: 19000, budgetCostAmount: 9600 },
      { quoteId: quoteBaseline.id, taskId: tLaunchUat.id, profileId: profilePM.id, days: 15, sellRatePerDay: 1100, costRateAssumptionPerDay: 580, revenueAmount: 16500, budgetCostAmount: 8700 },
      { quoteId: quoteBaseline.id, taskId: tLaunchCutover.id, profileId: profileTechLead.id, days: 6, sellRatePerDay: 1400, costRateAssumptionPerDay: 750, revenueAmount: 8400, budgetCostAmount: 4500 },
    ],
  })

  // VALIDATED change-order quote (avenant) — signed but pre-effective until
  // May 15. Work-table should hide it before effectiveAt; consolidation banner
  // surfaces it as upcoming.
  const quoteAvenant = await prisma.quote.create({
    data: {
      projectId: projectNimbus.id,
      title: 'Nimbus Rebuild — Avenant SSO',
      status: 'VALIDATED',
      sentAt: new Date('2026-04-22'),
      validatedAt: new Date('2026-05-02'),
      effectiveAt: new Date('2026-05-15'),
    },
  })

  await prisma.quoteLine.createMany({
    data: [
      { quoteId: quoteAvenant.id, taskId: tBuildApi.id, profileId: profileTechLead.id, days: 5, sellRatePerDay: 1400, costRateAssumptionPerDay: 750, revenueAmount: 7000, budgetCostAmount: 3750 },
      { quoteId: quoteAvenant.id, taskId: tBuildFront.id, profileId: profileDev.id, days: 10, sellRatePerDay: 950, costRateAssumptionPerDay: 480, revenueAmount: 9500, budgetCostAmount: 4800 },
    ],
  })

  // DRAFT quote — being prepared internally.
  await prisma.quote.create({
    data: {
      projectId: projectNimbus.id,
      title: 'Nimbus Rebuild — Run & support',
      status: 'DRAFT',
    },
  })

  // Assignment slots — Bob on tech-lead tasks, Clara on dev tasks, Daniel on PM tasks.
  const slotBobArch = await prisma.assignmentSlot.create({
    data: { projectId: projectNimbus.id, taskId: tDiscArch.id, profileId: profileTechLead.id, employeeId: empBob.id },
  })
  const slotBobApi = await prisma.assignmentSlot.create({
    data: { projectId: projectNimbus.id, taskId: tBuildApi.id, profileId: profileTechLead.id, employeeId: empBob.id },
  })
  const slotClaraApi = await prisma.assignmentSlot.create({
    data: { projectId: projectNimbus.id, taskId: tBuildApi.id, profileId: profileDev.id, employeeId: empClara.id },
  })
  const slotClaraFront = await prisma.assignmentSlot.create({
    data: { projectId: projectNimbus.id, taskId: tBuildFront.id, profileId: profileDev.id, employeeId: empClara.id },
  })
  const slotDanielWorkshops = await prisma.assignmentSlot.create({
    data: { projectId: projectNimbus.id, taskId: tDiscWorkshops.id, profileId: profilePM.id, employeeId: empDaniel.id },
  })
  const slotDanielUat = await prisma.assignmentSlot.create({
    data: { projectId: projectNimbus.id, taskId: tLaunchUat.id, profileId: profilePM.id, employeeId: empDaniel.id },
  })

  // Planned days across recent + upcoming weeks. PeriodKey is monthCode__weekCode.
  const W18 = '2026M5__2026W18'
  const W19 = '2026M5__2026W19'
  const W20 = '2026M5__2026W20'
  const W21 = '2026M5__2026W21'

  await prisma.plannedDay.createMany({
    data: [
      // Bob — tech lead across arch + API
      { assignmentSlotId: slotBobArch.id, periodKey: W18, days: 2 },
      { assignmentSlotId: slotBobApi.id, periodKey: W19, days: 4 },
      { assignmentSlotId: slotBobApi.id, periodKey: W20, days: 5 },
      { assignmentSlotId: slotBobApi.id, periodKey: W21, days: 3 },
      // Clara — dev across API + frontend
      { assignmentSlotId: slotClaraApi.id, periodKey: W18, days: 5 },
      { assignmentSlotId: slotClaraApi.id, periodKey: W19, days: 5 },
      { assignmentSlotId: slotClaraFront.id, periodKey: W20, days: 4 },
      { assignmentSlotId: slotClaraFront.id, periodKey: W21, days: 5 },
      // Daniel — PM across workshops + UAT
      { assignmentSlotId: slotDanielWorkshops.id, periodKey: W18, days: 1 },
      { assignmentSlotId: slotDanielUat.id, periodKey: W20, days: 2 },
      { assignmentSlotId: slotDanielUat.id, periodKey: W21, days: 2 },
    ],
  })

  // Period-start snapshots so the work table can render "remaining at start".
  await prisma.profileTaskPeriodStart.createMany({
    data: [
      { taskId: tDiscArch.id, profileId: profileTechLead.id, periodKey: MONTH, remainingAtStart: 8, soldAtStart: 12 },
      { taskId: tBuildApi.id, profileId: profileTechLead.id, periodKey: MONTH, remainingAtStart: 20, soldAtStart: 25 },
      { taskId: tBuildApi.id, profileId: profileDev.id, periodKey: MONTH, remainingAtStart: 50, soldAtStart: 60 },
      { taskId: tBuildFront.id, profileId: profileDev.id, periodKey: MONTH, remainingAtStart: 45, soldAtStart: 45 },
      { taskId: tLaunchUat.id, profileId: profilePM.id, periodKey: MONTH, remainingAtStart: 15, soldAtStart: 15 },
    ],
  })

  // ── Historical spent time on Nimbus — March + April 2026 ─────────────────
  // APPROVED weekly timesheets, one bundle per (employee, week). Each
  // TaskTimesheet carries the frozen rates that would be snapshotted on
  // approval (appliedCostRatePerDay, appliedCostAmount, appliedSellRatePerDay,
  // appliedSellAmount) so cost/revenue accounting survives later rate changes.

  type HistEntry = {
    employeeId: string
    employeeCostRate: number
    periodKey: string
    workDate: string
    slotId: string
    sellRate: number
    days: number
  }

  function approvedDate(periodKey: string) {
    // Pretend the approver clicked through on the Friday of the same week.
    const m = periodKey.match(/(\d{4})W(\d{2})$/)
    if (!m) return new Date()
    // For simplicity: Monday of ISO week + 4 days = Friday.
    const year = parseInt(m[1], 10)
    const week = parseInt(m[2], 10)
    // ISO week 1: week containing Jan 4. Find its Monday.
    const jan4 = new Date(Date.UTC(year, 0, 4))
    const jan4Dow = jan4.getUTCDay() || 7 // Sunday=7
    const week1Mon = new Date(jan4)
    week1Mon.setUTCDate(jan4.getUTCDate() - (jan4Dow - 1))
    const monday = new Date(week1Mon)
    monday.setUTCDate(week1Mon.getUTCDate() + (week - 1) * 7)
    monday.setUTCDate(monday.getUTCDate() + 4)
    return monday
  }

  // Helper: every Mon-Fri in this list of (periodKey, workDate, days) tuples
  // gets one TaskTimesheet attached to the corresponding employee bundle.
  const historicalEntries: HistEntry[] = [
    // ── Bob — Tech Lead — Discovery architecture (March) ──
    { employeeId: empBob.id, employeeCostRate: 750, periodKey: '2026M3__2026W11', workDate: '2026-03-10', slotId: slotBobArch.id, sellRate: 1400, days: 1 },
    { employeeId: empBob.id, employeeCostRate: 750, periodKey: '2026M3__2026W11', workDate: '2026-03-12', slotId: slotBobArch.id, sellRate: 1400, days: 1 },
    { employeeId: empBob.id, employeeCostRate: 750, periodKey: '2026M3__2026W12', workDate: '2026-03-17', slotId: slotBobArch.id, sellRate: 1400, days: 1 },
    { employeeId: empBob.id, employeeCostRate: 750, periodKey: '2026M3__2026W12', workDate: '2026-03-19', slotId: slotBobArch.id, sellRate: 1400, days: 1 },
    { employeeId: empBob.id, employeeCostRate: 750, periodKey: '2026M3__2026W13', workDate: '2026-03-24', slotId: slotBobArch.id, sellRate: 1400, days: 1 },
    { employeeId: empBob.id, employeeCostRate: 750, periodKey: '2026M3__2026W13', workDate: '2026-03-26', slotId: slotBobArch.id, sellRate: 1400, days: 1 },
    // ── Bob — Tech Lead — API platform (April) ──
    { employeeId: empBob.id, employeeCostRate: 750, periodKey: '2026M4__2026W15', workDate: '2026-04-07', slotId: slotBobApi.id, sellRate: 1400, days: 1 },
    { employeeId: empBob.id, employeeCostRate: 750, periodKey: '2026M4__2026W15', workDate: '2026-04-09', slotId: slotBobApi.id, sellRate: 1400, days: 1 },
    { employeeId: empBob.id, employeeCostRate: 750, periodKey: '2026M4__2026W16', workDate: '2026-04-14', slotId: slotBobApi.id, sellRate: 1400, days: 1 },
    { employeeId: empBob.id, employeeCostRate: 750, periodKey: '2026M4__2026W16', workDate: '2026-04-16', slotId: slotBobApi.id, sellRate: 1400, days: 1 },
    { employeeId: empBob.id, employeeCostRate: 750, periodKey: '2026M4__2026W17', workDate: '2026-04-21', slotId: slotBobApi.id, sellRate: 1400, days: 1 },
    { employeeId: empBob.id, employeeCostRate: 750, periodKey: '2026M4__2026W17', workDate: '2026-04-23', slotId: slotBobApi.id, sellRate: 1400, days: 1 },

    // ── Clara — Developer — API platform (March) ──
    { employeeId: empClara.id, employeeCostRate: 480, periodKey: '2026M3__2026W11', workDate: '2026-03-09', slotId: slotClaraApi.id, sellRate: 950, days: 1 },
    { employeeId: empClara.id, employeeCostRate: 480, periodKey: '2026M3__2026W11', workDate: '2026-03-10', slotId: slotClaraApi.id, sellRate: 950, days: 1 },
    { employeeId: empClara.id, employeeCostRate: 480, periodKey: '2026M3__2026W11', workDate: '2026-03-11', slotId: slotClaraApi.id, sellRate: 950, days: 1 },
    { employeeId: empClara.id, employeeCostRate: 480, periodKey: '2026M3__2026W11', workDate: '2026-03-13', slotId: slotClaraApi.id, sellRate: 950, days: 1 },
    { employeeId: empClara.id, employeeCostRate: 480, periodKey: '2026M3__2026W12', workDate: '2026-03-16', slotId: slotClaraApi.id, sellRate: 950, days: 1 },
    { employeeId: empClara.id, employeeCostRate: 480, periodKey: '2026M3__2026W12', workDate: '2026-03-17', slotId: slotClaraApi.id, sellRate: 950, days: 1 },
    { employeeId: empClara.id, employeeCostRate: 480, periodKey: '2026M3__2026W12', workDate: '2026-03-19', slotId: slotClaraApi.id, sellRate: 950, days: 1 },
    { employeeId: empClara.id, employeeCostRate: 480, periodKey: '2026M3__2026W12', workDate: '2026-03-20', slotId: slotClaraApi.id, sellRate: 950, days: 1 },
    { employeeId: empClara.id, employeeCostRate: 480, periodKey: '2026M3__2026W13', workDate: '2026-03-23', slotId: slotClaraApi.id, sellRate: 950, days: 1 },
    { employeeId: empClara.id, employeeCostRate: 480, periodKey: '2026M3__2026W13', workDate: '2026-03-25', slotId: slotClaraApi.id, sellRate: 950, days: 1 },
    { employeeId: empClara.id, employeeCostRate: 480, periodKey: '2026M3__2026W13', workDate: '2026-03-26', slotId: slotClaraApi.id, sellRate: 950, days: 1 },
    // ── Clara — Developer — API platform (April) ──
    { employeeId: empClara.id, employeeCostRate: 480, periodKey: '2026M4__2026W15', workDate: '2026-04-06', slotId: slotClaraApi.id, sellRate: 950, days: 1 },
    { employeeId: empClara.id, employeeCostRate: 480, periodKey: '2026M4__2026W15', workDate: '2026-04-08', slotId: slotClaraApi.id, sellRate: 950, days: 1 },
    { employeeId: empClara.id, employeeCostRate: 480, periodKey: '2026M4__2026W15', workDate: '2026-04-10', slotId: slotClaraApi.id, sellRate: 950, days: 1 },
    { employeeId: empClara.id, employeeCostRate: 480, periodKey: '2026M4__2026W16', workDate: '2026-04-13', slotId: slotClaraApi.id, sellRate: 950, days: 1 },
    { employeeId: empClara.id, employeeCostRate: 480, periodKey: '2026M4__2026W16', workDate: '2026-04-14', slotId: slotClaraApi.id, sellRate: 950, days: 1 },
    { employeeId: empClara.id, employeeCostRate: 480, periodKey: '2026M4__2026W16', workDate: '2026-04-16', slotId: slotClaraApi.id, sellRate: 950, days: 1 },
    { employeeId: empClara.id, employeeCostRate: 480, periodKey: '2026M4__2026W17', workDate: '2026-04-20', slotId: slotClaraApi.id, sellRate: 950, days: 1 },
    { employeeId: empClara.id, employeeCostRate: 480, periodKey: '2026M4__2026W17', workDate: '2026-04-22', slotId: slotClaraApi.id, sellRate: 950, days: 1 },
    { employeeId: empClara.id, employeeCostRate: 480, periodKey: '2026M4__2026W17', workDate: '2026-04-24', slotId: slotClaraApi.id, sellRate: 950, days: 1 },

    // ── Daniel — Project Manager — Workshops (March) ──
    { employeeId: empDaniel.id, employeeCostRate: 580, periodKey: '2026M3__2026W11', workDate: '2026-03-10', slotId: slotDanielWorkshops.id, sellRate: 1100, days: 0.5 },
    { employeeId: empDaniel.id, employeeCostRate: 580, periodKey: '2026M3__2026W12', workDate: '2026-03-17', slotId: slotDanielWorkshops.id, sellRate: 1100, days: 1 },
    { employeeId: empDaniel.id, employeeCostRate: 580, periodKey: '2026M3__2026W12', workDate: '2026-03-19', slotId: slotDanielWorkshops.id, sellRate: 1100, days: 0.5 },
    { employeeId: empDaniel.id, employeeCostRate: 580, periodKey: '2026M3__2026W13', workDate: '2026-03-24', slotId: slotDanielWorkshops.id, sellRate: 1100, days: 1 },
    { employeeId: empDaniel.id, employeeCostRate: 580, periodKey: '2026M3__2026W13', workDate: '2026-03-26', slotId: slotDanielWorkshops.id, sellRate: 1100, days: 0.5 },
  ]

  // Group entries by (employeeId, periodKey) so we create exactly one
  // Timesheet bundle per pair — TaskTimesheet rows attach to that bundle.
  const bundleKey = (e: HistEntry) => `${e.employeeId}::${e.periodKey}`
  const bundles = new Map<string, { employeeId: string; periodKey: string; entries: HistEntry[] }>()
  for (const entry of historicalEntries) {
    const key = bundleKey(entry)
    const existing = bundles.get(key)
    if (existing) existing.entries.push(entry)
    else bundles.set(key, { employeeId: entry.employeeId, periodKey: entry.periodKey, entries: [entry] })
  }

  for (const bundle of bundles.values()) {
    const approvedAt = approvedDate(bundle.periodKey)
    const ts = await prisma.timesheet.create({
      data: {
        employeeId: bundle.employeeId,
        periodKey: bundle.periodKey,
        status: 'APPROVED',
        submittedAt: approvedAt,
        submittedById: adminUser.id,
        approvedAt,
        approvedById: adminUser.id,
      },
    })
    await prisma.taskTimesheet.createMany({
      data: bundle.entries.map((entry) => ({
        timesheetId: ts.id,
        assignmentSlotId: entry.slotId,
        workDate: new Date(entry.workDate),
        days: entry.days,
        appliedCostRatePerDay: entry.employeeCostRate,
        appliedCostAmount: entry.days * entry.employeeCostRate,
        appliedSellRatePerDay: entry.sellRate,
        appliedSellAmount: entry.days * entry.sellRate,
      })),
    })
  }

  // A DRAFT timesheet for Clara on the OPEN week, with two entries.
  const tsClara = await prisma.timesheet.create({
    data: { employeeId: empClara.id, periodKey: OPEN_PERIOD_KEY, status: 'DRAFT' },
  })
  await prisma.taskTimesheet.createMany({
    data: [
      { timesheetId: tsClara.id, assignmentSlotId: slotClaraApi.id, workDate: new Date('2026-05-04'), days: 1 },
      { timesheetId: tsClara.id, assignmentSlotId: slotClaraApi.id, workDate: new Date('2026-05-05'), days: 1 },
    ],
  })

  // ── Third project: Beta Refactor ────────────────────────────────────────
  // Minimal scenario: 1 phase, 3 tasks, 1 profile, 1 employee. Started in
  // January 2026 with a baseline quote covering 2 of the 3 tasks; a second
  // quote signed in March extended scope to the third task. Each quote is
  // 20 days per task. Useful to demo the "scope extension via avenant"
  // pattern with no employee/profile noise.

  const clientBeta = await prisma.client.create({
    data: {
      name: 'Beta Industries',
      contactName: 'Sophie Laurent',
      contactEmail: 'sophie@beta.test',
      addressLine1: '7 Place Bellecour',
      postalCode: '13001',
      city: 'Marseille',
      country: 'FR',
    },
  })

  const profileEngineer = await prisma.profile.create({
    data: { name: 'Software Engineer', defaultSellRatePerDay: 1000, defaultCostRatePerDay: 500 },
  })

  const empEve = await prisma.employee.create({
    data: {
      name: 'Eve Schmidt',
      active: true,
      currentCostRatePerDay: 500,
      costRates: { create: { validFrom: new Date('2026-01-01'), costRatePerDay: 500 } },
    },
  })

  const projectBeta = await prisma.project.create({
    data: {
      clientId: clientBeta.id,
      name: 'Beta Refactor',
      currency: 'EUR',
      startDate: new Date('2026-01-05'),
      endDate: new Date('2026-08-31'),
    },
  })

  const betaPhase = await prisma.phase.create({
    data: { projectId: projectBeta.id, name: 'Realisation', sortOrder: 1 },
  })

  const betaTaskA = await prisma.task.create({
    data: { phaseId: betaPhase.id, name: 'Task A — Core refactor', sortOrder: 1, status: 'active' },
  })
  const betaTaskB = await prisma.task.create({
    data: { phaseId: betaPhase.id, name: 'Task B — API surface', sortOrder: 2, status: 'active' },
  })
  const betaTaskC = await prisma.task.create({
    data: { phaseId: betaPhase.id, name: 'Task C — Reporting', sortOrder: 3, status: 'planned' },
  })

  // Baseline quote (January) — covers Task A + Task B, 20 days each.
  const betaQuoteBaseline = await prisma.quote.create({
    data: {
      projectId: projectBeta.id,
      title: 'Beta Refactor — Baseline',
      status: 'VALIDATED',
      sentAt: new Date('2025-12-18'),
      validatedAt: new Date('2025-12-22'),
      effectiveAt: new Date('2026-01-05'),
    },
  })
  await prisma.quoteLine.createMany({
    data: [
      { quoteId: betaQuoteBaseline.id, taskId: betaTaskA.id, profileId: profileEngineer.id, days: 20, sellRatePerDay: 1000, costRateAssumptionPerDay: 500, revenueAmount: 20000, budgetCostAmount: 10000 },
      { quoteId: betaQuoteBaseline.id, taskId: betaTaskB.id, profileId: profileEngineer.id, days: 20, sellRatePerDay: 1000, costRateAssumptionPerDay: 500, revenueAmount: 20000, budgetCostAmount: 10000 },
    ],
  })

  // Avenant (March) — extends Task B and adds Task C, 20 days each.
  const betaQuoteAvenant = await prisma.quote.create({
    data: {
      projectId: projectBeta.id,
      title: 'Beta Refactor — Avenant Reporting',
      status: 'VALIDATED',
      sentAt: new Date('2026-02-20'),
      validatedAt: new Date('2026-02-27'),
      effectiveAt: new Date('2026-03-02'),
    },
  })
  await prisma.quoteLine.createMany({
    data: [
      { quoteId: betaQuoteAvenant.id, taskId: betaTaskB.id, profileId: profileEngineer.id, days: 20, sellRatePerDay: 1000, costRateAssumptionPerDay: 500, revenueAmount: 20000, budgetCostAmount: 10000 },
      { quoteId: betaQuoteAvenant.id, taskId: betaTaskC.id, profileId: profileEngineer.id, days: 20, sellRatePerDay: 1000, costRateAssumptionPerDay: 500, revenueAmount: 20000, budgetCostAmount: 10000 },
    ],
  })

  // One assignment slot per task — Eve only person on the project.
  const slotEveA = await prisma.assignmentSlot.create({
    data: { projectId: projectBeta.id, taskId: betaTaskA.id, profileId: profileEngineer.id, employeeId: empEve.id },
  })
  const slotEveB = await prisma.assignmentSlot.create({
    data: { projectId: projectBeta.id, taskId: betaTaskB.id, profileId: profileEngineer.id, employeeId: empEve.id },
  })
  const slotEveC = await prisma.assignmentSlot.create({
    data: { projectId: projectBeta.id, taskId: betaTaskC.id, profileId: profileEngineer.id, employeeId: empEve.id },
  })

  // ── Timesheet history for Beta (Jan → Apr) ───────────────────────────────
  // One APPROVED bundle per week. Task A consumed Jan-early Feb, switch to
  // Task B mid-Feb through April, Task C ramps in April after avenant kicks
  // in. Roughly tracks the contract: A ≈ 17/20d, B ≈ 30/40d, C ≈ 10/20d.

  type BetaEntry = { periodKey: string; workDate: string; slotId: string; days: number }
  const betaEntries: BetaEntry[] = [
    // ── January (Task A) ──
    { periodKey: '2026M1__2026W2', workDate: '2026-01-06', slotId: slotEveA.id, days: 1 },
    { periodKey: '2026M1__2026W2', workDate: '2026-01-07', slotId: slotEveA.id, days: 1 },
    { periodKey: '2026M1__2026W2', workDate: '2026-01-08', slotId: slotEveA.id, days: 1 },
    { periodKey: '2026M1__2026W3', workDate: '2026-01-12', slotId: slotEveA.id, days: 1 },
    { periodKey: '2026M1__2026W3', workDate: '2026-01-13', slotId: slotEveA.id, days: 1 },
    { periodKey: '2026M1__2026W3', workDate: '2026-01-14', slotId: slotEveA.id, days: 1 },
    { periodKey: '2026M1__2026W3', workDate: '2026-01-15', slotId: slotEveA.id, days: 1 },
    { periodKey: '2026M1__2026W4', workDate: '2026-01-19', slotId: slotEveA.id, days: 1 },
    { periodKey: '2026M1__2026W4', workDate: '2026-01-20', slotId: slotEveA.id, days: 1 },
    { periodKey: '2026M1__2026W4', workDate: '2026-01-21', slotId: slotEveA.id, days: 1 },
    { periodKey: '2026M1__2026W4', workDate: '2026-01-22', slotId: slotEveA.id, days: 1 },
    { periodKey: '2026M1__2026W4', workDate: '2026-01-23', slotId: slotEveA.id, days: 1 },
    { periodKey: '2026M1__2026W5', workDate: '2026-01-26', slotId: slotEveA.id, days: 1 },
    { periodKey: '2026M1__2026W5', workDate: '2026-01-27', slotId: slotEveA.id, days: 1 },
    { periodKey: '2026M1__2026W5', workDate: '2026-01-28', slotId: slotEveA.id, days: 1 },
    { periodKey: '2026M1__2026W5', workDate: '2026-01-29', slotId: slotEveA.id, days: 1 },
    { periodKey: '2026M1__2026W5', workDate: '2026-01-30', slotId: slotEveA.id, days: 1 },

    // ── February (finish Task A, start Task B) ──
    { periodKey: '2026M2__2026W6', workDate: '2026-02-02', slotId: slotEveB.id, days: 1 },
    { periodKey: '2026M2__2026W6', workDate: '2026-02-03', slotId: slotEveB.id, days: 1 },
    { periodKey: '2026M2__2026W6', workDate: '2026-02-04', slotId: slotEveB.id, days: 1 },
    { periodKey: '2026M2__2026W6', workDate: '2026-02-05', slotId: slotEveB.id, days: 1 },
    { periodKey: '2026M2__2026W6', workDate: '2026-02-06', slotId: slotEveB.id, days: 1 },
    { periodKey: '2026M2__2026W7', workDate: '2026-02-09', slotId: slotEveB.id, days: 1 },
    { periodKey: '2026M2__2026W7', workDate: '2026-02-10', slotId: slotEveB.id, days: 1 },
    { periodKey: '2026M2__2026W7', workDate: '2026-02-11', slotId: slotEveB.id, days: 1 },
    { periodKey: '2026M2__2026W7', workDate: '2026-02-12', slotId: slotEveB.id, days: 1 },
    { periodKey: '2026M2__2026W7', workDate: '2026-02-13', slotId: slotEveB.id, days: 1 },
    { periodKey: '2026M2__2026W8', workDate: '2026-02-16', slotId: slotEveB.id, days: 1 },
    { periodKey: '2026M2__2026W8', workDate: '2026-02-17', slotId: slotEveB.id, days: 1 },
    { periodKey: '2026M2__2026W8', workDate: '2026-02-18', slotId: slotEveB.id, days: 1 },
    { periodKey: '2026M2__2026W8', workDate: '2026-02-19', slotId: slotEveB.id, days: 1 },
    { periodKey: '2026M2__2026W9', workDate: '2026-02-23', slotId: slotEveB.id, days: 1 },
    { periodKey: '2026M2__2026W9', workDate: '2026-02-24', slotId: slotEveB.id, days: 1 },
    { periodKey: '2026M2__2026W9', workDate: '2026-02-25', slotId: slotEveB.id, days: 1 },
    { periodKey: '2026M2__2026W9', workDate: '2026-02-26', slotId: slotEveB.id, days: 1 },

    // ── March (Task B grinding, avenant kicks in Mar 2) ──
    { periodKey: '2026M3__2026W11', workDate: '2026-03-09', slotId: slotEveB.id, days: 1 },
    { periodKey: '2026M3__2026W11', workDate: '2026-03-10', slotId: slotEveB.id, days: 1 },
    { periodKey: '2026M3__2026W11', workDate: '2026-03-11', slotId: slotEveB.id, days: 1 },
    { periodKey: '2026M3__2026W11', workDate: '2026-03-12', slotId: slotEveB.id, days: 1 },
    { periodKey: '2026M3__2026W11', workDate: '2026-03-13', slotId: slotEveB.id, days: 1 },
    { periodKey: '2026M3__2026W12', workDate: '2026-03-16', slotId: slotEveB.id, days: 1 },
    { periodKey: '2026M3__2026W12', workDate: '2026-03-17', slotId: slotEveB.id, days: 1 },
    { periodKey: '2026M3__2026W12', workDate: '2026-03-18', slotId: slotEveB.id, days: 1 },
    { periodKey: '2026M3__2026W12', workDate: '2026-03-19', slotId: slotEveB.id, days: 1 },
    { periodKey: '2026M3__2026W13', workDate: '2026-03-23', slotId: slotEveB.id, days: 1 },
    { periodKey: '2026M3__2026W13', workDate: '2026-03-24', slotId: slotEveB.id, days: 1 },
    { periodKey: '2026M3__2026W13', workDate: '2026-03-25', slotId: slotEveB.id, days: 1 },

    // ── April (Task B wrap-up + start Task C) ──
    { periodKey: '2026M4__2026W15', workDate: '2026-04-06', slotId: slotEveB.id, days: 1 },
    { periodKey: '2026M4__2026W15', workDate: '2026-04-07', slotId: slotEveB.id, days: 1 },
    { periodKey: '2026M4__2026W15', workDate: '2026-04-09', slotId: slotEveC.id, days: 1 },
    { periodKey: '2026M4__2026W15', workDate: '2026-04-10', slotId: slotEveC.id, days: 1 },
    { periodKey: '2026M4__2026W16', workDate: '2026-04-13', slotId: slotEveC.id, days: 1 },
    { periodKey: '2026M4__2026W16', workDate: '2026-04-14', slotId: slotEveC.id, days: 1 },
    { periodKey: '2026M4__2026W16', workDate: '2026-04-15', slotId: slotEveC.id, days: 1 },
    { periodKey: '2026M4__2026W16', workDate: '2026-04-16', slotId: slotEveC.id, days: 1 },
    { periodKey: '2026M4__2026W17', workDate: '2026-04-20', slotId: slotEveC.id, days: 1 },
    { periodKey: '2026M4__2026W17', workDate: '2026-04-21', slotId: slotEveC.id, days: 1 },
    { periodKey: '2026M4__2026W17', workDate: '2026-04-22', slotId: slotEveC.id, days: 1 },
  ]

  const betaBundles = new Map<string, BetaEntry[]>()
  for (const entry of betaEntries) {
    const arr = betaBundles.get(entry.periodKey) ?? []
    arr.push(entry)
    betaBundles.set(entry.periodKey, arr)
  }
  for (const [periodKey, entries] of betaBundles) {
    const approved = approvedDate(periodKey)
    const ts = await prisma.timesheet.create({
      data: {
        employeeId: empEve.id,
        periodKey,
        status: 'APPROVED',
        submittedAt: approved,
        submittedById: adminUser.id,
        approvedAt: approved,
        approvedById: adminUser.id,
      },
    })
    await prisma.taskTimesheet.createMany({
      data: entries.map((entry) => ({
        timesheetId: ts.id,
        assignmentSlotId: entry.slotId,
        workDate: new Date(entry.workDate),
        days: entry.days,
        appliedCostRatePerDay: 500,
        appliedCostAmount: entry.days * 500,
        appliedSellRatePerDay: 1000,
        appliedSellAmount: entry.days * 1000,
      })),
    })
  }

  // ── Global state ────────────────────────────────────────────────────────
  await prisma.globalTimesheetWindow.create({
    data: {
      id: 'global',
      openPeriodKey: OPEN_PERIOD_KEY,
    },
  })

  await prisma.auditLog.create({
    data: {
      entity: 'GlobalTimesheetWindow',
      entityId: 'global',
      action: 'CREATE',
      actorId: adminUser.id,
      after: { openPeriodKey: OPEN_PERIOD_KEY },
      metadata: { reason: 'seed' },
    },
  })

  console.log('✔ Seed done')
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error(err)
    return prisma.$disconnect().finally(() => process.exit(1))
  })
