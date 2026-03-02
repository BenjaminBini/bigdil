import type { User, UserRole } from '@/api/types'

export const USERS: User[] = [
  {
    id: 'u1',
    email: 'marie.dupont@acme-consulting.fr',
    role: 'PM',
    name: 'Marie Dupont',
    employeeId: null,
  },
  {
    id: 'u2',
    email: 'jean.martin@acme-consulting.fr',
    role: 'CONSULTANT',
    name: 'Jean Martin',
    employeeId: 'e1',
  },
  {
    id: 'u3',
    email: 'sophie.bernard@acme-consulting.fr',
    role: 'CONSULTANT',
    name: 'Sophie Bernard',
    employeeId: 'e2',
  },
  {
    id: 'u4',
    email: 'thomas.petit@acme-consulting.fr',
    role: 'CONSULTANT',
    name: 'Thomas Petit',
    employeeId: 'e3',
  },
  {
    id: 'u5',
    email: 'claire.moreau@acme-consulting.fr',
    role: 'ADMIN',
    name: 'Claire Moreau',
    employeeId: null,
  },
  {
    id: 'u6',
    email: 'luc.leroy@acme-consulting.fr',
    role: 'FINANCE',
    name: 'Luc Leroy',
    employeeId: null,
  },
  {
    id: 'u7',
    email: 'nathalie.roux@acme-consulting.fr',
    role: 'EXEC',
    name: 'Nathalie Roux',
    employeeId: null,
  },
  {
    id: 'u8',
    email: 'paul.girard@acme-consulting.fr',
    role: 'CONSULTANT',
    name: 'Paul Girard',
    employeeId: 'e4',
  },
]

export const LAST_LOGIN_DATES: Record<string, string> = {
  u1: '2026-02-27',
  u2: '2026-02-26',
  u3: '2026-02-25',
  u4: '2026-02-24',
  u5: '2026-02-20',
  u6: '2026-02-19',
  u7: '2026-02-10',
  u8: '2026-02-27',
}

export const ROLE_OPTIONS: UserRole[] = ['ADMIN', 'PM', 'CONSULTANT', 'FINANCE', 'EXEC']
