import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useUpdateProject } from '@/api/hooks'
import type { ProjectDetail } from '@/api/types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/shared/form-field'
import { VStack } from '@/components/shared/VStack'

const CURRENCY_OPTIONS = ['EUR', 'USD', 'GBP', 'CHF', 'CAD']

interface EditProjectDialogProps {
  project: ProjectDetail
  open: boolean
  onClose: () => void
}

export function EditProjectDialog({ project, open, onClose }: EditProjectDialogProps) {
  const { t } = useTranslation('pages')
  const [name, setName] = useState(project.name)
  const [currency, setCurrency] = useState(project.currency)
  const [startDate, setStartDate] = useState(project.startDate ?? '')
  const [endDate, setEndDate] = useState(project.endDate ?? '')

  useEffect(() => {
    if (open) {
      setName(project.name)
      setCurrency(project.currency)
      setStartDate(project.startDate ?? '')
      setEndDate(project.endDate ?? '')
    }
  }, [open, project])

  const updateProject = useUpdateProject(project.id)

  function handleClose() {
    onClose()
  }

  function handleSave() {
    if (!name.trim()) { toast.error(t('projects.dialog.nameRequired')); return }
    if (!currency.trim()) { toast.error(t('projects.dialog.currencyRequired')); return }

    updateProject.mutate(
      {
        name: name.trim(),
        currency: currency.trim(),
        startDate: startDate || null,
        endDate: endDate || null,
      },
      {
        onSuccess: () => {
          toast.success(t('projects.dialog.updatedToast'))
          handleClose()
        },
        onError: () => toast.error(t('projects.dialog.updateFailed')),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
      <DialogContent size="sm">
        <form onSubmit={(e) => { e.preventDefault(); handleSave() }}>
        <DialogHeader>
          <DialogTitle>{t('projects.dialog.editTitle')}</DialogTitle>
        </DialogHeader>

        <VStack gap="xl">
          <FormField label={t('projects.dialog.projectName')} htmlFor="ep-name">
            <Input
              id="ep-name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </FormField>

          <FormField label={t('projects.dialog.currency')} htmlFor="ep-currency">
            <select
              id="ep-currency"
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              {CURRENCY_OPTIONS.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label={t('projects.dialog.startDate')} htmlFor="ep-start">
              <Input
                id="ep-start"
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
            </FormField>
            <FormField label={t('projects.dialog.endDate')} htmlFor="ep-end">
              <Input
                id="ep-end"
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
              />
            </FormField>
          </div>
        </VStack>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>{t('projects.dialog.cancel')}</Button>
          <Button type="submit" disabled={updateProject.isPending}>
            {updateProject.isPending ? t('projects.dialog.saving') : t('projects.dialog.save')}
          </Button>
        </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
