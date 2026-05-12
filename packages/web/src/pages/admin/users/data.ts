import type { UserRole } from '@/api/types'

// TODO: last-login tracking is not yet persisted server-side. Remove this
// mock once a real session/login event log lands.
export const LAST_LOGIN_DATES: Record<string, string> = {}

export const ROLE_OPTIONS: UserRole[] = ['ADMIN', 'PM', 'CONSULTANT', 'FINANCE', 'EXEC']
