import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useUpdateClient } from '@/api/hooks'
import type { Client } from '@/api/types'
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

interface EditClientDialogProps {
  client: Client
  open: boolean
  onClose: () => void
}

export function EditClientDialog({ client, open, onClose }: EditClientDialogProps) {
  const [name, setName] = useState(client.name)
  const [contactName, setContactName] = useState(client.contactName)
  const [contactEmail, setContactEmail] = useState(client.contactEmail)
  const [address, setAddress] = useState(client.address)

  useEffect(() => {
    if (open) {
      setName(client.name)
      setContactName(client.contactName)
      setContactEmail(client.contactEmail)
      setAddress(client.address)
    }
  }, [open, client])

  const updateClient = useUpdateClient()

  function handleClose() {
    onClose()
  }

  function handleSave() {
    if (!name.trim()) { toast.error('Client name is required'); return }
    if (!contactName.trim()) { toast.error('Contact name is required'); return }
    if (!contactEmail.trim()) { toast.error('Contact email is required'); return }

    updateClient.mutate(
      {
        id: client.id,
        name: name.trim(),
        contactName: contactName.trim(),
        contactEmail: contactEmail.trim(),
        address: address.trim(),
      },
      {
        onSuccess: () => {
          toast.success('Client updated')
          handleClose()
        },
        onError: () => toast.error('Failed to update client'),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
      <DialogContent size="sm">
        <form onSubmit={(e) => { e.preventDefault(); handleSave() }}>
        <DialogHeader>
          <DialogTitle>Edit Client</DialogTitle>
        </DialogHeader>

        <VStack gap="xl">
          <FormField label="Company Name" htmlFor="ec-name">
            <Input
              id="ec-name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </FormField>

          <FormField label="Contact Name" htmlFor="ec-contact-name">
            <Input
              id="ec-contact-name"
              value={contactName}
              onChange={e => setContactName(e.target.value)}
            />
          </FormField>

          <FormField label="Contact Email" htmlFor="ec-contact-email">
            <Input
              id="ec-contact-email"
              type="email"
              value={contactEmail}
              onChange={e => setContactEmail(e.target.value)}
            />
          </FormField>

          <FormField label="Address" htmlFor="ec-address">
            <Input
              id="ec-address"
              value={address}
              onChange={e => setAddress(e.target.value)}
            />
          </FormField>
        </VStack>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
          <Button type="submit" disabled={updateClient.isPending}>
            {updateClient.isPending ? 'Saving…' : 'Save Changes'}
          </Button>
        </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
