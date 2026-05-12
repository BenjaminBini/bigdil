import { test, expect } from '@playwright/test'

// Foundation smoke test for T007. Asserts the seeded baseline renders end-to-end:
// API reachable, web boots, the consultant's seeded DRAFT timesheet shows up.
//
// Follow-up (T007.b) — full one-month lifecycle:
//   1. edit days, save draft, submit
//   2. switch to admin view, approve
//   3. advance window, repeat through end of month
//   4. open snapshots, click Create snapshot, verify it lands in the list
test.describe('one-month lifecycle (foundation)', () => {
  test('seeded admin sees the open-period timesheet', async ({ page }) => {
    await page.goto('/timesheets')

    // Seed inserts Alice Martin as Admin's linked employee with one DRAFT
    // taskTimesheet for OPEN_PERIOD_KEY=2026M5__2026W19 against task "Discovery".
    await expect(page.getByText('Alice Martin', { exact: false })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'Discovery' })).toBeVisible()
  })

  test('approvals page is reachable', async ({ page }) => {
    await page.goto('/approvals')
    // No SUBMITTED rows in the seed — page should still render its shell.
    await expect(page).toHaveURL(/\/approvals$/)
  })

  test('admin window control is mounted in the topbar', async ({ page }) => {
    await page.goto('/timesheets')
    // Window control button exposes the current open week label, e.g. "Semaine 19".
    await expect(page.getByRole('button', { name: /Semaine|Week/ })).toBeVisible()
  })
})
