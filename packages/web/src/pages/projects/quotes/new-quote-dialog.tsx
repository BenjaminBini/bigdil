import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useCreateQuote } from '@/api/hooks'
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

interface NewQuoteDialogProps {
  open: boolean
  onClose: () => void
  projectId: string
}

export function NewQuoteDialog({ open, onClose, projectId }: NewQuoteDialogProps) {
  const { t } = useTranslation(['forms', 'pages', 'common'])
  const navigate = useNavigate()
  const [title, setTitle] = useState('')

  const createQuote = useCreateQuote(projectId)

  function handleClose() {
    setTitle('')
    onClose()
  }

  function handleCreate() {
    if (!title.trim()) { toast.error(t('forms:dialogs.titleRequired')); return }
    createQuote.mutate(
      { title: title.trim() },
      {
        onSuccess: (quote) => {
          toast.success(t('pages:quotes.createSuccess'))
          handleClose()
          navigate(`/projects/${projectId}/quotes/${quote.id}`)
        },
        onError: () => toast.error(t('forms:dialogs.quoteCreateFailed')),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
      <DialogContent size="sm">
        <form onSubmit={(e) => { e.preventDefault(); handleCreate() }}>
        <DialogHeader>
          <DialogTitle>{t('pages:quotes.newQuote')}</DialogTitle>
        </DialogHeader>

        <FormField label={t('forms:fields.title')} htmlFor="nq-title">
          <Input
            id="nq-title"
            placeholder={t('forms:dialogs.quoteTitlePlaceholder')}
            value={title}
            onChange={e => setTitle(e.target.value)}
            autoFocus
          />
        </FormField>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>{t('common:actions.cancel')}</Button>
          <Button type="submit" disabled={createQuote.isPending}>
            {createQuote.isPending ? t('forms:dialogs.creating') : t('forms:buttons.createQuote')}
          </Button>
        </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
