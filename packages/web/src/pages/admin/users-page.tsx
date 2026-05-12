import { useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { User } from '@/api/types'
import { useCurrentUser, useImpersonate, useReferenceData, useUsers } from '@/api/hooks'
import { Button } from '@/components/ui/button'
import { LoadingState, ErrorState, PageContainer } from '@/components/shared/page-container'
import { FlexBetween } from '@/components/shared/layouts'
import { PageTitle } from '@/components/shared/page-title'
import { MutedText } from '@/components/shared/muted-text'
import { EditUserDialog } from './users/edit-user-dialog'
import { NewUserDialog } from './users/new-user-dialog'
import { UsersTable } from './users/users-table'

export default function UsersPage() {
  const [newUserOpen, setNewUserOpen] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)

  const { data: refData, isLoading: refLoading, error: refError } = useReferenceData()
  const { data: users, isLoading: usersLoading, error: usersError } = useUsers()
  const { data: session } = useCurrentUser()
  const impersonate = useImpersonate()

  if (refLoading || usersLoading) return <LoadingState />
  if (refError || usersError || !refData || !users) return <ErrorState />

  const isAdmin = session?.realUser.role === 'ADMIN'

  function handleEdit(user: User) {
    setEditUser(user)
  }

  function handleResetPassword(user: User) {
    toast.info(`Reset email sent to ${user.email}`)
  }

  function handleDeactivate(user: User) {
    toast.warning(`Deactivating ${user.name}…`)
  }

  function handleImpersonate(user: User) {
    if (!session) return
    if (user.id === session.realUser.id) {
      toast.error('Cannot impersonate yourself')
      return
    }
    impersonate.mutate(user.id, {
      onSuccess: (next) => toast.success(`Now acting as ${next.user.name}`),
      onError: (err) => toast.error(err instanceof Error ? err.message : 'Impersonation failed'),
    })
  }

  return (
    <PageContainer size="lg">
      <FlexBetween>
        <div>
          <PageTitle>Gestion des utilisateurs</PageTitle>
          <MutedText spacing="tight">
            {users.length} utilisateur{users.length !== 1 ? 's' : ''}
          </MutedText>
        </div>
        <Button onClick={() => setNewUserOpen(true)}>
          <Plus />
          Nouvel utilisateur
        </Button>
      </FlexBetween>

      <UsersTable
        users={users}
        employees={refData.employees}
        currentUserId={session?.realUser.id ?? null}
        canImpersonate={isAdmin}
        onEdit={handleEdit}
        onResetPassword={handleResetPassword}
        onDeactivate={handleDeactivate}
        onImpersonate={handleImpersonate}
      />

      <NewUserDialog
        open={newUserOpen}
        onClose={() => setNewUserOpen(false)}
        employees={refData.employees}
      />

      <EditUserDialog
        open={editUser !== null}
        user={editUser}
        employees={refData.employees}
        onClose={() => setEditUser(null)}
      />
    </PageContainer>
  )
}
