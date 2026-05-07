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
      toast.error('Le nom du projet est requis')
      return
    }
    if (!clientId) {
      toast.error('Le client est requis')
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
          toast.success(`Projet « ${project.name} » créé`)
          handleClose()
        },
        onError: () => {
          toast.error('Échec de la création du projet')
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Nouveau projet</DialogTitle>
        </DialogHeader>

        <VStack gap="xl">
          <FormField label="Nom du projet" htmlFor="np-name">
            <Input
              id="np-name"
              placeholder="ex. Transformation Digitale"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormField>

          <FormField label="Client" htmlFor="np-client">
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger id="np-client">
                <SelectValue placeholder="Sélectionner un client" />
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

          <FormField label="Devise" htmlFor="np-currency">
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

          <FormField label="Date de début" htmlFor="np-start">
            <Input
              id="np-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </FormField>

          <FormField label="Date de fin" htmlFor="np-end">
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
            Annuler
          </Button>
          <Button onClick={handleCreate} disabled={createProject.isPending}>
            {createProject.isPending ? 'Création…' : 'Créer le projet'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
