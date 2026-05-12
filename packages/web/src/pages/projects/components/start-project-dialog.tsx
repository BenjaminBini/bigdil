import { useTranslation, Trans } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { SuccessButton } from '@/components/shared/button-adapters'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

function previewPeriods(startDate: string, endDate: string) {
  const periods: Array<{ num: number; start: string; end: string }> = []
  const end = new Date(endDate)
  let current = new Date(startDate)
  let num = 1
  while (current <= end) {
    const pEnd = new Date(current)
    pEnd.setDate(pEnd.getDate() + 6)
    if (pEnd > end) pEnd.setTime(end.getTime())
    periods.push({ num, start: current.toISOString().split('T')[0], end: pEnd.toISOString().split('T')[0] })
    current.setDate(current.getDate() + 7)
    num++
  }
  return periods
}

interface StartProjectDialogProps {
  open: boolean
  startDate: string
  endDate: string
  isPending: boolean
  onConfirm: () => void
  onClose: () => void
}

export function StartProjectDialog({ open, startDate, endDate, isPending, onConfirm, onClose }: StartProjectDialogProps) {
  const { t } = useTranslation('pages')
  const periods = startDate && endDate ? previewPeriods(startDate, endDate) : []

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('projects.startDialog.title')}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          <Trans
            i18nKey="projects.startDialog.description"
            count={periods.length}
            ns="pages"
            components={{ 1: <strong /> }}
          />
        </p>
        <div className="max-h-48 overflow-y-auto rounded border text-sm">
          <table className="w-full">
            <thead className="bg-muted text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-1.5 text-left">#</th>
                <th className="px-3 py-1.5 text-left">{t('projects.startDialog.startCol')}</th>
                <th className="px-3 py-1.5 text-left">{t('projects.startDialog.endCol')}</th>
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
          <Button variant="outline" onClick={onClose}>{t('projects.startDialog.cancel')}</Button>
          <SuccessButton disabled={isPending} onClick={onConfirm}>
            {isPending ? t('projects.startDialog.starting') : t('projects.startDialog.confirm')}
          </SuccessButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
