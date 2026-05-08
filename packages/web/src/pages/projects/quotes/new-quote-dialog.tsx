import { useState } from 'react'
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
  const [title, setTitle] = useState('')
  const [effectiveAt, setEffectiveAt] = useState('')

  const createQuote = useCreateQuote(projectId)

  function handleClose() {
    setTitle('')
    setEffectiveAt('')
    onClose()
  }

  function handleCreate() {
    if (!title.trim()) { toast.error('Le titre est requis'); return }
    createQuote.mutate(
      { title: title.trim(), effectiveAt: effectiveAt || null },
      {
        onSuccess: () => {
          toast.success('Devis créé')
          handleClose()
        },
        onError: () => toast.error('Échec de la création'),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Nouveau devis</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Titre" htmlFor="nq-title">
            <Input
              id="nq-title"
              placeholder="ex. Périmètre initial"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCreate() }}
              autoFocus
            />
          </FormField>
          <FormField label="Date d'effet" htmlFor="nq-effective">
            <Input
              id="nq-effective"
              type="date"
              value={effectiveAt}
              onChange={e => setEffectiveAt(e.target.value)}
            />
          </FormField>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Annuler</Button>
          <Button onClick={handleCreate} disabled={createQuote.isPending}>
            {createQuote.isPending ? 'Création…' : 'Créer le devis'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
