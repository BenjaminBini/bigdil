import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { SuccessButton, WarningButton } from '@/components/shared/button-adapters'
import type { ProjectStatus } from '@/api/types'

interface ProjectActionsProps {
  status: ProjectStatus
}

export function ProjectActions({ status }: ProjectActionsProps) {
  function actionToast(label: string) {
    toast.info(`Would execute: ${label}`)
  }

  switch (status) {
    case 'IN_PROGRESS':
      return (
        <>
          <Button size="sm" onClick={() => actionToast('Activate Next Period')}>
            Activate Next Period
          </Button>
          <WarningButton size="sm" onClick={() => actionToast('Close Period')}>
            Close Period
          </WarningButton>
          <Button size="sm" variant="outline" disabled title="Cannot complete while periods remain open">
            Complete Project
          </Button>
        </>
      )
    case 'TO_PLAN':
      return (
        <>
          <Button size="sm" onClick={() => actionToast('Set Dates & Plan')}>
            Set Dates &amp; Plan
          </Button>
          <SuccessButton size="sm" disabled title="Complete planning before starting">
            Start Project
          </SuccessButton>
        </>
      )
    case 'DRAFT':
      return (
        <Button size="sm" onClick={() => actionToast('Send for Approval')}>
          Send for Approval
        </Button>
      )
    case 'WAITING_APPROVAL':
      return (
        <>
          <SuccessButton size="sm" onClick={() => actionToast('Client Approved')}>
            Client Approved
          </SuccessButton>
          <Button size="sm" variant="destructive" onClick={() => actionToast('Client Rejected')}>
            Client Rejected
          </Button>
        </>
      )
    default:
      return null
  }
}
