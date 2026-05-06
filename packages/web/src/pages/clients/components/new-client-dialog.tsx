import { useState } from 'react'
import { toast } from 'sonner'
import { useCreateClient } from '@/api/hooks'
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

interface NewClientDialogProps {
  open: boolean
  onClose: () => void
}

export function NewClientDialog({ open, onClose }: NewClientDialogProps) {
  const [name, setName] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [address, setAddress] = useState('')

  const createClient = useCreateClient()

  function handleClose() {
    setName('')
    setContactName('')
    setContactEmail('')
    setAddress('')
    onClose()
  }

  function handleCreate() {
    if (!name.trim()) { toast.error('Client name is required'); return }
    if (!contactName.trim()) { toast.error('Contact name is required'); return }
    if (!contactEmail.trim()) { toast.error('Contact email is required'); return }

    createClient.mutate(
      { name: name.trim(), contactName: contactName.trim(), contactEmail: contactEmail.trim(), address: address.trim() },
      {
        onSuccess: (client) => {
          toast.success(`Client "${client.name}" created`)
          handleClose()
        },
        onError: () => toast.error('Failed to create client'),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>New Client</DialogTitle>
        </DialogHeader>

        <VStack gap="xl">
          <FormField label="Company Name" htmlFor="nc-name">
            <Input
              id="nc-name"
              placeholder="e.g. Acme Corp"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormField>

          <FormField label="Contact Name" htmlFor="nc-contact-name">
            <Input
              id="nc-contact-name"
              placeholder="e.g. Marie Dupont"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
            />
          </FormField>

          <FormField label="Contact Email" htmlFor="nc-contact-email">
            <Input
              id="nc-contact-email"
              type="email"
              placeholder="e.g. marie@acme.fr"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
          </FormField>

          <FormField label="Address" htmlFor="nc-address">
            <Input
              id="nc-address"
              placeholder="e.g. 42 rue de Rivoli, 75001 Paris"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </FormField>
        </VStack>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleCreate} disabled={createClient.isPending}>
            {createClient.isPending ? 'Creating…' : 'Create Client'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
