import { execSync } from 'node:child_process'

// Reset the dev DB to the seeded baseline before the e2e run so tests start
// from a known fixture. Honors `E2E_SKIP_DB_RESET=1` for fast local iteration
// when you've already seeded by hand.
async function globalSetup() {
  if (process.env.E2E_SKIP_DB_RESET === '1') {
    console.log('[e2e] skipping DB reset (E2E_SKIP_DB_RESET=1)')
    return
  }

  console.log('[e2e] resetting + seeding DB…')
  execSync('pnpm --filter @bigdil/db db:seed', {
    stdio: 'inherit',
    env: { ...process.env, PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION: 'e2e-test' },
  })
}

export default globalSetup
