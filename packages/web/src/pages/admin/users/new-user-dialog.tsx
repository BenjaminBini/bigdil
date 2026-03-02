import { useState } from 'react'
import type { ReactNode } from 'react'
import { toast } from 'sonner'
import type { Employee, UserRole } from '@/api/types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ROLE_OPTIONS } from './data'

interface NewUserDialogProps {
  open: boolean
  onClose: () => void
  employees: Employee[]
}

export function NewUserDialog({ open, onClose, employees }: NewUserDialogProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<UserRole>('CONSULTANT')
  const [employeeLink, setEmployeeLink] = useState('none')

  function handleCreate() {
    if (!name.trim() || !email.trim()) {
      toast.error('Name and email are required')
      return
    }

    toast.success(`User "${name}" created successfully`)
    setName('')
    setEmail('')
    setRole('CONSULTANT')
    setEmployeeLink('none')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New User</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Field label="Full Name" htmlFor="nu-name">
            <Input
              id="nu-name"
              placeholder="e.g. Marie Dupont"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>

          <Field label="Email" htmlFor="nu-email">
            <Input
              id="nu-email"
              type="email"
              placeholder="e.g. marie.dupont@acme.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>

          <Field label="Role" htmlFor="nu-role">
            <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
              <SelectTrigger id="nu-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((roleOption) => (
                  <SelectItem key={roleOption} value={roleOption}>
                    {roleOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Linked Employee" htmlFor="nu-employee">
            <Select value={employeeLink} onValueChange={setEmployeeLink}>
              <SelectTrigger id="nu-employee">
                <SelectValue placeholder="None (admin/PM/exec)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">- None -</SelectItem>
                {employees
                  .filter((employee) => employee.active)
                  .map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">Link to an employee record for timesheet access</p>
          </Field>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate}>Create User</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface FieldProps {
  label: string
  htmlFor: string
  children: ReactNode
}

function Field({ label, htmlFor, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  )
}
