import { useState } from 'react'
import { toast } from 'sonner'
import { useCreateProject } from '@/api/hooks'
import { useReferenceData } from '@/api/hooks'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FormField } from '@/components/shared/form-field'
import { VStack } from '@/components/shared/VStack'

const CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF']

interface NewProjectDialogProps {
  open: boolean
  onClose: () => void
}

export function NewProjectDialog({ open, onClose }: NewProjectDialogProps) {
  const [name, setName] = useState('')
  const [clientId, setClientId] = useState('')
  const [currency, setCurrency] = useState('EUR')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const { data: refData } = useReferenceData()
  const createProject = useCreateProject()

  function handleClose() {
    setName('')
    setClientId('')
    setCurrency('EUR')
    setStartDate('')
    setEndDate('')
    onClose()
  }

  function handleCreate() {
    if (!name.trim()) {
      toast.error('Project name is required')
      return
    }
    if (!clientId) {
      toast.error('Client is required')
      return
    }

    createProject.mutate(
      {
        name: name.trim(),
        clientId,
        currency,
        startDate: startDate || null,
        endDate: endDate || null,
      },
      {
        onSuccess: (project) => {
          toast.success(`Project "${project.name}" created`)
          handleClose()
        },
        onError: () => {
          toast.error('Failed to create project')
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>New Project</DialogTitle>
        </DialogHeader>

        <VStack gap="xl">
          <FormField label="Project Name" htmlFor="np-name">
            <Input
              id="np-name"
              placeholder="e.g. Digital Transformation"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormField>

          <FormField label="Client" htmlFor="np-client">
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger id="np-client">
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {(refData?.clients ?? []).map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Currency" htmlFor="np-currency">
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger id="np-currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Start Date" htmlFor="np-start">
            <Input
              id="np-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </FormField>

          <FormField label="End Date" htmlFor="np-end">
            <Input
              id="np-end"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </FormField>
        </VStack>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={createProject.isPending}>
            {createProject.isPending ? 'Creating…' : 'Create Project'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
