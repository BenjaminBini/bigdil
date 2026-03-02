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
          <TableRow className="bg-gray-50">
            <HeadCell label="Name" />
            <HeadCell label="Email" />
            <HeadCell label="Role" />
            <HeadCell label="Linked Employee" />
            <HeadCell label="Active" />
            <HeadCell label="Last Login" />
            <HeadCell label="Actions" className="text-right" />
          </TableRow>
        </TableHeader>

        <TableBody>
          {users.map((user) => {
            const linkedEmployee = user.employeeId ? employees.find((employee) => employee.id === user.employeeId) : null
            const loginDate = LAST_LOGIN_DATES[user.id]
            const isActive = linkedEmployee === null || linkedEmployee === undefined || linkedEmployee.active

            return (
              <TableRow key={user.id} className="hover:bg-gray-50">
                <TableCell className="py-3.5 font-medium text-gray-900">{user.name}</TableCell>
                <TableCell className="text-sm text-gray-600">{user.email}</TableCell>
                <TableCell>
                  <RoleBadge role={user.role} />
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {linkedEmployee ? linkedEmployee.name : <span className="text-gray-400">—</span>}
                </TableCell>
                <TableCell>
                  <ActiveBadge active={isActive} />
                </TableCell>
                <TableCell className="text-sm tabular-nums text-gray-500">
                  {loginDate ? formatLastLogin(loginDate) : <span className="text-gray-400">—</span>}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(user)} title="Edit user">
                      <Pencil className="size-3.5" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onResetPassword(user)}
                      title="Reset password"
                    >
                      <KeyRound className="size-3.5" />
                      Reset Password
                    </Button>
                    <Button
                      variant="destructive-outline"
                      size="sm"
                      onClick={() => onDeactivate(user)}
                      title="Deactivate user"
                    >
                      <UserX className="size-3.5" />
                      Deactivate
                    </Button>
                  </div>
                </TableCell>
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