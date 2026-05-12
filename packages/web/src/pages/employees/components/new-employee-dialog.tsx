import { useState } from 'react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useCreateEmployee } from '@/api/hooks'
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
import { TextCaption } from '@/components/shared/text-caption'

interface NewEmployeeDialogProps {
  open: boolean
  onClose: () => void
}

export function NewEmployeeDialog({ open, onClose }: NewEmployeeDialogProps) {
  const { t } = useTranslation('pages')
  const [name, setName] = useState('')
  const [costRate, setCostRate] = useState('')

  const createEmployee = useCreateEmployee()

  function handleClose() {
    setName('')
    setCostRate('')
    onClose()
  }

  function handleCreate() {
    if (!name.trim()) { toast.error(t('employees.dialog.nameRequired')); return }
    const rate = parseFloat(costRate)
    if (isNaN(rate) || rate < 0) { toast.error(t('employees.dialog.rateInvalid')); return }

    createEmployee.mutate(
      { name: name.trim(), currentCostRatePerDay: rate },
      {
        onSuccess: (employee) => {
          toast.success(t('employees.dialog.createdToast', { name: employee.name }))
          handleClose()
        },
        onError: () => toast.error(t('employees.dialog.createFailed')),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
      <DialogContent size="sm">
        <form onSubmit={(e) => { e.preventDefault(); handleCreate() }}>
        <DialogHeader>
          <DialogTitle>{t('employees.dialog.newTitle')}</DialogTitle>
        </DialogHeader>

        <VStack gap="xl">
          <FormField label={t('employees.dialog.fullName')} htmlFor="ne-name">
            <Input
              id="ne-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormField>

          <FormField label={t('employees.dialog.costRatePerDay')} htmlFor="ne-cost-rate">
            <Input
              id="ne-cost-rate"
              type="number"
              min={0}
              value={costRate}
              onChange={(e) => setCostRate(e.target.value)}
            />
            <TextCaption>{t('employees.dialog.costRateCaption')}</TextCaption>
          </FormField>
        </VStack>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>{t('employees.dialog.cancel')}</Button>
          <Button type="submit" disabled={createEmployee.isPending}>
            {createEmployee.isPending ? t('employees.dialog.creating') : t('employees.dialog.create')}
          </Button>
        </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
