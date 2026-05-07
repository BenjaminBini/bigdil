import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { SuccessButton } from '@/components/shared/button-adapters'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useUpdateProjectStatus } from '@/api/hooks'
import type { ProjectStatus } from '@/api/types'

interface ProjectActionsProps {
  projectId: string
  status: ProjectStatus
  startDate?: string | null
  endDate?: string | null
}

function previewPeriods(startDate: string, endDate: string) {
  const periods: Array<{ num: number; start: string; end: string }> = []
  const end = new Date(endDate)
  let current = new Date(startDate)
  let num = 1
  while (current <= end) {
    const pEnd = new Date(current)
    pEnd.setDate(pEnd.getDate() + 6)
    if (pEnd > end) pEnd.setTime(end.getTime())
    periods.push({
      num,
      start: current.toISOString().split('T')[0],
      end: pEnd.toISOString().split('T')[0],
    })
    current.setDate(current.getDate() + 7)
    num++
  }
  return periods
}

export function ProjectActions({ projectId, status, startDate, endDate }: ProjectActionsProps) {
  const updateStatus = useUpdateProjectStatus(projectId)
  const [showConfirm, setShowConfirm] = useState(false)
  const hasDates = !!(startDate && endDate)

  function transition(nextStatus: string, label: string) {
    updateStatus.mutate(nextStatus, {
      onSuccess: () => { toast.success(label); setShowConfirm(false) },
      onError: (err) => toast.error(err instanceof Error ? err.message : `Échec : ${label}`),
    })
  }

  const isPending = updateStatus.isPending
  const periods = hasDates ? previewPeriods(startDate!, endDate!) : []

  switch (status) {
    case 'IN_PROGRESS':
      return (
        <Button size="sm" variant="outline" disabled title="Impossible de clôturer tant que des périodes restent ouvertes">
          Clôturer le projet
        </Button>
      )
    case 'TO_PLAN':
      return (
        <>
          <SuccessButton
            size="sm"
            disabled={!hasDates}
            title={!hasDates ? 'Définissez les dates de début et de fin du projet' : undefined}
            onClick={() => setShowConfirm(true)}
          >
            Planifier
          </SuccessButton>

          <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Générer les périodes de planification</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                Cela va générer <strong>{periods.length} période{periods.length !== 1 ? 's' : ''} hebdomadaire{periods.length !== 1 ? 's' : ''}</strong> et passer le projet en mode <strong>Planification</strong>.
                Toutes les périodes seront créées en statut <em>Futur</em> — rien n'est ouvert tant que vous ne démarrez pas le projet.
              </p>
              <div className="max-h-48 overflow-y-auto rounded border text-sm">
                <table className="w-full">
                  <thead className="bg-muted text-xs text-muted-foreground">
                    <tr>
                      <th className="px-3 py-1.5 text-left">#</th>
                      <th className="px-3 py-1.5 text-left">Début</th>
                      <th className="px-3 py-1.5 text-left">Fin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {periods.map((p) => (
                      <tr key={p.num} className="border-t">
                        <td className="px-3 py-1">{p.num}</td>
                        <td className="px-3 py-1">{p.start}</td>
                        <td className="px-3 py-1">{p.end}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowConfirm(false)}>Annuler</Button>
                <SuccessButton disabled={isPending} onClick={() => transition('PLANNING', 'Planifier')}>
                  {isPending ? 'Génération…' : 'Générer les périodes'}
                </SuccessButton>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )
    case 'PLANNING':
      return (
        <SuccessButton size="sm" disabled={isPending} onClick={() => transition('IN_PROGRESS', 'Démarrer le projet')}>
          {isPending ? 'Démarrage…' : 'Démarrer le projet'}
        </SuccessButton>
      )
    case 'DRAFT':
      return (
        <SuccessButton size="sm" disabled={isPending} onClick={() => transition('TO_PLAN', 'Activer le projet')}>
          {isPending ? 'Activation…' : 'Activer le projet'}
        </SuccessButton>
      )
    default:
      return null
  }
}
