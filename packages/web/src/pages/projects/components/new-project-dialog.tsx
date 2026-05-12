import { useState } from 'react'
import { useTranslation } from 'react-i18next'
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

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

// Defaults: start = 1st of next month, end = 3 months after start.
function defaultProjectDates(): { start: string; end: string } {
  const now = new Date()
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1))
  const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 3, 1))
  return { start: toIsoDate(start), end: toIsoDate(end) }
}

export function NewProjectDialog({ open, onClose }: NewProjectDialogProps) {
  const { t } = useTranslation(['forms', 'pages', 'common'])
  const defaults = defaultProjectDates()
  const [name, setName] = useState('')
  const [clientId, setClientId] = useState('')
  const [currency, setCurrency] = useState('EUR')
  const [startDate, setStartDate] = useState(defaults.start)
  const [endDate, setEndDate] = useState(defaults.end)

  const { data: refData } = useReferenceData()
  const createProject = useCreateProject()

  function handleClose() {
    const next = defaultProjectDates()
    setName('')
    setClientId('')
    setCurrency('EUR')
    setStartDate(next.start)
    setEndDate(next.end)
    onClose()
  }

  function handleCreate() {
    if (!name.trim()) {
      toast.error(t('forms:dialogs.projectNameRequired'))
      return
    }
    if (!clientId) {
      toast.error(t('forms:dialogs.clientRequired'))
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
          toast.success(t('forms:dialogs.projectCreated', { name: project.name }))
          handleClose()
        },
        onError: () => {
          toast.error(t('forms:dialogs.projectCreateFailed'))
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
      <DialogContent size="sm">
        <form onSubmit={(e) => { e.preventDefault(); handleCreate() }}>
        <DialogHeader>
          <DialogTitle>{t('pages:projects.newProject')}</DialogTitle>
        </DialogHeader>

        <VStack gap="xl">
          <FormField label={`${t('forms:fields.name')} ${t('forms:fields.project').toLowerCase()}`} htmlFor="np-name">
            <Input
              id="np-name"
              placeholder={t('forms:dialogs.projectNamePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormField>

          <FormField label={t('forms:fields.client')} htmlFor="np-client">
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger id="np-client">
                <SelectValue placeholder={t('forms:dialogs.selectClient')} />
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

          <FormField label={t('forms:fields.currency')} htmlFor="np-currency">
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

          <FormField label={t('forms:fields.startDate')} htmlFor="np-start">
            <Input
              id="np-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </FormField>

          <FormField label={t('forms:fields.endDate')} htmlFor="np-end">
            <Input
              id="np-end"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </FormField>
        </VStack>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            {t('common:actions.cancel')}
          </Button>
          <Button type="submit" disabled={createProject.isPending}>
            {createProject.isPending ? t('forms:dialogs.creating') : t('forms:buttons.createProject')}
          </Button>
        </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
