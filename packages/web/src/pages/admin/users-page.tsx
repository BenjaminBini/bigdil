import { useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { User } from '@/api/types'
import { useReferenceData } from '@/api/hooks'
import { Button } from '@/components/ui/button'
import { NewUserDialog } from './users/new-user-dialog'
import { USERS } from './users/data'
import { UsersTable } from './users/users-table'

export default function UsersPage() {
  const [newUserOpen, setNewUserOpen] = useState(false)
  const { data: refData, isLoading, error } = useReferenceData()

  if (isLoading) return <div className="p-6">Loading...</div>
  if (error || !refData) return <div className="p-6">Error loading data</div>

  function handleEdit(user: User) {
    toast.info(`Edit user: ${user.name}`)
  }

  function handleResetPassword(user: User) {
    toast.info(`Password reset email sent to ${user.email}`)
  }

  function handleDeactivate(user: User) {
    toast.warning(`Deactivating ${user.name}…`)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">User Management</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {USERS.length} user{USERS.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => setNewUserOpen(true)}>
          <Plus />
          New User
        </Button>
      </div>

      <UsersTable
        users={USERS}
        employees={refData.employees}
        onEdit={handleEdit}
        onResetPassword={handleResetPassword}
        onDeactivate={handleDeactivate}
      />

      <NewUserDialog
        open={newUserOpen}
        onClose={() => setNewUserOpen(false)}
        employees={refData.employees}
      />
    </div>
  )
}
