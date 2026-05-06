import { useState } from 'react'
import { toast } from 'sonner'
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
    if (!validFrom) { toast.error('Valid from date is required'); return }
    const rate = Number(costRatePerDay)
    if (!costRatePerDay || rate < 0) { toast.error('Rate must be a non-negative number'); return }

    addRate.mutate(
      { validFrom, costRatePerDay: rate },
      {
        onSuccess: () => {
          toast.success(`New rate added for ${employeeName}`)
          handleClose()
        },
        onError: () => toast.error('Failed to add rate period'),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Add Rate Period — {employeeName}</DialogTitle>
        </DialogHeader>

        <VStack gap="xl">
          <FormField label="Effective From" htmlFor="ar-from">
            <Input
              id="ar-from"
              type="date"
              value={validFrom}
              onChange={e => setValidFrom(e.target.value)}
            />
          </FormField>

          <FormField label="Cost Rate / Day" htmlFor="ar-rate">
            <Input
              id="ar-rate"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 650"
              value={costRatePerDay}
              onChange={e => setCostRatePerDay(e.target.value)}
            />
          </FormField>
        </VStack>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={addRate.isPending}>
            {addRate.isPending ? 'Saving…' : 'Add Rate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
