import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useCloseProject, useReopenProject } from '@/api/hooks'

interface ProjectActionsProps {
  projectId: string
  isClosed: boolean
  hasDates: boolean
}

export function ProjectActions({ projectId, isClosed, hasDates }: ProjectActionsProps) {
  const closeProject = useCloseProject(projectId)
  const reopenProject = useReopenProject(projectId)

  if (isClosed) {
    return (
      <Button
        size="sm"
        variant="outline"
        disabled={reopenProject.isPending}
        onClick={() =>
          reopenProject.mutate(undefined, {
            onSuccess: () => toast.success('Projet rouvert'),
            onError: (err) => toast.error(err instanceof Error ? err.message : 'Échec de la réouverture'),
          })
        }
      >
        {reopenProject.isPending ? 'Réouverture…' : 'Rouvrir le projet'}
      </Button>
    )
  }

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={closeProject.isPending || !hasDates}
      title={!hasDates ? 'Définissez d\'abord les dates du projet' : undefined}
      onClick={() =>
        closeProject.mutate(undefined, {
          onSuccess: () => toast.success('Projet clôturé'),
          onError: (err) => toast.error(err instanceof Error ? err.message : 'Échec de la clôture'),
        })
      }
    >
      {closeProject.isPending ? 'Clôture…' : 'Clôturer le projet'}
    </Button>
  )
}
