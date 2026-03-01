import { KeyRound, Pencil, UserX } from 'lucide-react'
import type { Employee, User } from '@/api/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
    <div className="overflow-hidden rounded-lg border bg-white shadow-xs">
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
                  <Badge className={isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {isActive ? 'Active' : 'Inactive'}
                  </Badge>
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
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
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
    </div>
  )
}

function formatLastLogin(date: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

interface HeadCellProps {
  label: string
  className?: string
}

function HeadCell({ label, className }: HeadCellProps) {
  return (
    <TableHead className={['text-xs font-semibold uppercase tracking-wide text-gray-500', className].join(' ').trim()}>
      {label}
    </TableHead>
  )
}
