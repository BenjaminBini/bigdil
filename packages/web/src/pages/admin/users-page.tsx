import { useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { User } from '@/api/types'
import { useReferenceData } from '@/api/hooks'
import { Button } from '@/components/ui/button'
import { LoadingState, ErrorState, PageContainer } from '@/components/shared/page-container'
import { FlexBetween } from '@/components/shared/layouts'
import { PageTitle } from '@/components/shared/page-title'
import { MutedText } from '@/components/shared/muted-text'
import { NewUserDialog } from './users/new-user-dialog'
import { USERS } from './users/data'
import { UsersTable } from './users/users-table'

export default function UsersPage() {
  const [newUserOpen, setNewUserOpen] = useState(false)
  const { data: refData, isLoading, error } = useReferenceData()

  if (isLoading) return <LoadingState />
  if (error || !refData) return <ErrorState />

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
    <PageContainer size="lg">
      <FlexBetween>
        <div>
          <PageTitle>User Management</PageTitle>
          <MutedText spacing="tight">
            {USERS.length} user{USERS.length !== 1 ? 's' : ''}
          </MutedText>
        </div>
        <Button onClick={() => setNewUserOpen(true)}>
          <Plus />
          New User
        </Button>
      </FlexBetween>

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
    </PageContainer>
  )
}
