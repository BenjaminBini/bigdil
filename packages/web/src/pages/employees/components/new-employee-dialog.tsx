import { useState } from 'react'
import { toast } from 'sonner'
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
  const [name, setName] = useState('')
  const [costRate, setCostRate] = useState('')

  const createEmployee = useCreateEmployee()

  function handleClose() {
    setName('')
    setCostRate('')
    onClose()
  }

  function handleCreate() {
    if (!name.trim()) { toast.error('Name is required'); return }
    const rate = parseFloat(costRate)
    if (isNaN(rate) || rate < 0) { toast.error('Valid cost rate is required'); return }

    createEmployee.mutate(
      { name: name.trim(), currentCostRatePerDay: rate },
      {
        onSuccess: (employee) => {
          toast.success(`Employee "${employee.name}" created`)
          handleClose()
        },
        onError: () => toast.error('Failed to create employee'),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
      <DialogContent size="sm">
        <form onSubmit={(e) => { e.preventDefault(); handleCreate() }}>
        <DialogHeader>
          <DialogTitle>New Employee</DialogTitle>
        </DialogHeader>

        <VStack gap="xl">
          <FormField label="Full Name" htmlFor="ne-name">
            <Input
              id="ne-name"
              placeholder="e.g. Jean Martin"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormField>

          <FormField label="Cost Rate / Day (EUR)" htmlFor="ne-cost-rate">
            <Input
              id="ne-cost-rate"
              type="number"
              min={0}
              placeholder="e.g. 450"
              value={costRate}
              onChange={(e) => setCostRate(e.target.value)}
            />
            <TextCaption>Starting cost rate. You can add rate history from the employee detail page.</TextCaption>
          </FormField>
        </VStack>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
          <Button type="submit" disabled={createEmployee.isPending}>
            {createEmployee.isPending ? 'Creating…' : 'Create Employee'}
          </Button>
        </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
