import { useState, useEffect } from 'react'
import { toast } from 'sonner'
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
    if (!name.trim()) { toast.error('Project name is required'); return }
    if (!currency.trim()) { toast.error('Currency is required'); return }

    updateProject.mutate(
      {
        name: name.trim(),
        currency: currency.trim(),
        startDate: startDate || null,
        endDate: endDate || null,
      },
      {
        onSuccess: () => {
          toast.success('Project updated')
          handleClose()
        },
        onError: () => toast.error('Failed to update project'),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>

        <VStack gap="xl">
          <FormField label="Project Name" htmlFor="ep-name">
            <Input
              id="ep-name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </FormField>

          <FormField label="Currency" htmlFor="ep-currency">
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
            <FormField label="Start Date" htmlFor="ep-start">
              <Input
                id="ep-start"
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
            </FormField>
            <FormField label="End Date" htmlFor="ep-end">
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
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={updateProject.isPending}>
            {updateProject.isPending ? 'Saving…' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
