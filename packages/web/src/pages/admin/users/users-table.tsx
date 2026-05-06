import { KeyRound, Pencil, UserX } from 'lucide-react'
import type { Employee, User } from '@/api/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { HeadCell } from '@/components/shared/head-cell'
import { TdPrimary, TdDetail, TdRight, NullCell } from '@/components/shared/table-cells'
import { FlexEnd } from '@/components/shared/layouts'
import { ActiveBadge } from '@/pages/employees/components/active-badge'
import { LAST_LOGIN_DATES } from './data'
import { RoleBadge } from './role-badge'

interface UsersTableProps {
  users: User[]
  employees: Employee[]
  onEdit: (user: User) => void
  onResetPassword: (user: User) => void
  onDeactivate: (user: User) => void
}

export function UsersTable({ users, employees, onEdit, onResetPassword, onDeactivate }: UsersTableProps) {
  return (
    <Card variant="flush">
      <Table>
        <TableHeader>
          <TableRow variant="header">
            <HeadCell label="Name" />
            <HeadCell label="Email" />
            <HeadCell label="Role" />
            <HeadCell label="Linked Employee" />
            <HeadCell label="Active" />
            <HeadCell label="Last Login" />
            <HeadCell label="Actions" align="right" />
          </TableRow>
        </TableHeader>

        <TableBody>
          {users.map((user) => {
            const linkedEmployee = user.employeeId ? employees.find((employee) => employee.id === user.employeeId) : null
            const loginDate = LAST_LOGIN_DATES[user.id]
            const isActive = linkedEmployee === null || linkedEmployee === undefined || linkedEmployee.active

            return (
              <TableRow key={user.id} variant="interactive">
                <TdPrimary>{user.name}</TdPrimary>
                <TdDetail>{user.email}</TdDetail>
                <TableCell>
                  <RoleBadge role={user.role} />
                </TableCell>
                <TdDetail>
                  {linkedEmployee ? linkedEmployee.name : <NullCell />}
                </TdDetail>
                <TableCell>
                  <ActiveBadge active={isActive} />
                </TableCell>
                <TdDetail tabularNums>
                  {loginDate ? formatLastLogin(loginDate) : <NullCell />}
                </TdDetail>
                <TdRight>
                  <FlexEnd gap="xs">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(user)} title="Edit user">
                      <Pencil size={14} />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onResetPassword(user)}
                      title="Reset password"
                    >
                      <KeyRound size={14} />
                      Reset Password
                    </Button>
                    <Button
                      variant="destructive-outline"
                      size="sm"
                      onClick={() => onDeactivate(user)}
                      title="Deactivate user"
                    >
                      <UserX size={14} />
                      Deactivate
                    </Button>
                  </FlexEnd>
                </TdRight>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Card>
  )
}

function formatLastLogin(date: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}
