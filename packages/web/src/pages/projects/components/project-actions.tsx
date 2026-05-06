import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { SuccessButton, WarningButton } from '@/components/shared/button-adapters'
import { useUpdateProjectStatus } from '@/api/hooks'
import type { ProjectStatus } from '@/api/types'

interface ProjectActionsProps {
  projectId: string
  status: ProjectStatus
}

export function ProjectActions({ projectId, status }: ProjectActionsProps) {
  const updateStatus = useUpdateProjectStatus(projectId)

  function transition(nextStatus: string, label: string) {
    updateStatus.mutate(nextStatus, {
      onSuccess: () => toast.success(`${label} — status updated`),
      onError: () => toast.error(`Failed: ${label}`),
    })
  }

  const isPending = updateStatus.isPending

  switch (status) {
    case 'IN_PROGRESS':
      return (
        <>
          <Button size="sm" variant="outline" disabled title="Cannot complete while periods remain open">
            Complete Project
          </Button>
        </>
      )
    case 'TO_PLAN':
      return (
        <SuccessButton size="sm" disabled={isPending} onClick={() => transition('IN_PROGRESS', 'Start Project')}>
          Start Project
        </SuccessButton>
      )
    case 'DRAFT':
      return (
        <Button size="sm" disabled={isPending} onClick={() => transition('WAITING_APPROVAL', 'Send for Approval')}>
          Send for Approval
        </Button>
      )
    case 'WAITING_APPROVAL':
      return (
        <>
          <SuccessButton size="sm" disabled={isPending} onClick={() => transition('TO_PLAN', 'Client Approved')}>
            Client Approved
          </SuccessButton>
          <Button size="sm" variant="destructive" disabled={isPending} onClick={() => transition('DRAFT', 'Client Rejected')}>
            Client Rejected
          </Button>
        </>
      )
    default:
      return null
  }
}
