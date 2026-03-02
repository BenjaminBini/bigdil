import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
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
          <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700" onClick={() => actionToast('Activate Next Period')}>
            Activate Next Period
          </Button>
          <Button size="sm" className="bg-orange-500 text-white hover:bg-orange-600" onClick={() => actionToast('Close Period')}>
            Close Period
          </Button>
          <Button size="sm" variant="outline" disabled title="Cannot complete while periods remain open">
            Complete Project
          </Button>
        </>
      )
    case 'TO_PLAN':
      return (
        <>
          <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700" onClick={() => actionToast('Set Dates & Plan')}>
            Set Dates &amp; Plan
          </Button>
          <Button size="sm" className="bg-green-600 text-white hover:bg-green-700" disabled title="Complete planning before starting">
            Start Project
          </Button>
        </>
      )
    case 'DRAFT':
      return (
        <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700" onClick={() => actionToast('Send for Approval')}>
          Send for Approval
        </Button>
      )
    case 'WAITING_APPROVAL':
      return (
        <>
          <Button size="sm" className="bg-green-600 text-white hover:bg-green-700" onClick={() => actionToast('Client Approved')}>
            Client Approved
          </Button>
          <Button size="sm" variant="destructive" onClick={() => actionToast('Client Rejected')}>
            Client Rejected
          </Button>
        </>
      )
    default:
      return null
  }
}
