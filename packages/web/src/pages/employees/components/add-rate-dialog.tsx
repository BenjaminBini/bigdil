import { useState } from 'react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useAddEmployeeRate } from '@/api/hooks'
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

interface AddRateDialogProps {
  employeeId: string
  employeeName: string
  open: boolean
  onClose: () => void
}

export function AddRateDialog({ employeeId, employeeName, open, onClose }: AddRateDialogProps) {
  const { t } = useTranslation('pages')
  const today = new Date().toISOString().split('T')[0]
  const [validFrom, setValidFrom] = useState(today)
  const [costRatePerDay, setCostRatePerDay] = useState('')

  const addRate = useAddEmployeeRate(employeeId)

  function handleClose() {
    setValidFrom(today)
    setCostRatePerDay('')
    onClose()
  }

  function handleSave() {
    if (!validFrom) { toast.error(t('employees.rateDialog.fromRequired')); return }
    const rate = Number(costRatePerDay)
    if (!costRatePerDay || rate < 0) { toast.error(t('employees.rateDialog.rateRequired')); return }

    addRate.mutate(
      { validFrom, costRatePerDay: rate },
      {
        onSuccess: () => {
          toast.success(t('employees.rateDialog.addedToast', { name: employeeName }))
          handleClose()
        },
        onError: () => toast.error(t('employees.rateDialog.saveFailed')),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
      <DialogContent size="sm">
        <form onSubmit={(e) => { e.preventDefault(); handleSave() }}>
        <DialogHeader>
          <DialogTitle>{t('employees.rateDialog.title', { name: employeeName })}</DialogTitle>
        </DialogHeader>

        <VStack gap="xl">
          <FormField label={t('employees.rateDialog.effectiveFrom')} htmlFor="ar-from">
            <Input
              id="ar-from"
              type="date"
              value={validFrom}
              onChange={e => setValidFrom(e.target.value)}
            />
          </FormField>

          <FormField label={t('employees.rateDialog.costRatePerDay')} htmlFor="ar-rate">
            <Input
              id="ar-rate"
              type="number"
              min="0"
              step="0.01"
              value={costRatePerDay}
              onChange={e => setCostRatePerDay(e.target.value)}
            />
          </FormField>
        </VStack>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>{t('employees.rateDialog.cancel')}</Button>
          <Button type="submit" disabled={addRate.isPending}>
            {addRate.isPending ? t('employees.rateDialog.saving') : t('employees.rateDialog.save')}
          </Button>
        </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
