import { useState } from 'react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
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

interface FormState {
  name: string
  contactName: string
  contactEmail: string
  addressLine1: string
  addressLine2: string
  postalCode: string
  city: string
  country: string
}

const emptyForm: FormState = {
  name: '',
  contactName: '',
  contactEmail: '',
  addressLine1: '',
  addressLine2: '',
  postalCode: '',
  city: '',
  country: 'FR',
}

export function NewClientDialog({ open, onClose }: NewClientDialogProps) {
  const { t } = useTranslation('pages')
  const [form, setForm] = useState<FormState>(emptyForm)
  const createClient = useCreateClient()

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleClose() {
    setForm(emptyForm)
    onClose()
  }

  function handleCreate() {
    if (!form.name.trim()) { toast.error(t('clients.dialog.nameRequired')); return }
    if (!form.contactName.trim()) { toast.error(t('clients.dialog.contactNameRequired')); return }
    if (!form.contactEmail.trim()) { toast.error(t('clients.dialog.contactEmailRequired')); return }
    if (!form.addressLine1.trim()) { toast.error(t('clients.dialog.addressRequired')); return }
    if (!form.postalCode.trim()) { toast.error(t('clients.dialog.postalRequired')); return }
    if (!form.city.trim()) { toast.error(t('clients.dialog.cityRequired')); return }
    if (!form.country.trim()) { toast.error(t('clients.dialog.countryRequired')); return }

    createClient.mutate(
      {
        name: form.name.trim(),
        contactName: form.contactName.trim(),
        contactEmail: form.contactEmail.trim(),
        addressLine1: form.addressLine1.trim(),
        addressLine2: form.addressLine2.trim() || null,
        postalCode: form.postalCode.trim(),
        city: form.city.trim(),
        country: form.country.trim().toUpperCase().slice(0, 2),
      },
      {
        onSuccess: (client) => {
          toast.success(t('clients.dialog.createdToast', { name: client.name }))
          handleClose()
        },
        onError: () => toast.error(t('clients.dialog.createFailed')),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
      <DialogContent size="sm">
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleCreate() }}>
          <DialogHeader>
            <DialogTitle>{t('clients.dialog.newTitle')}</DialogTitle>
          </DialogHeader>

          <VStack gap="xl">
            <FormField label={t('clients.dialog.companyName')} htmlFor="nc-name">
              <Input
                id="nc-name"
                placeholder="ex. Acme Corp"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
              />
            </FormField>

            <FormField label={t('clients.dialog.contactName')} htmlFor="nc-contact-name">
              <Input
                id="nc-contact-name"
                placeholder="ex. Marie Dupont"
                value={form.contactName}
                onChange={(e) => update('contactName', e.target.value)}
              />
            </FormField>

            <FormField label={t('clients.dialog.contactEmail')} htmlFor="nc-contact-email">
              <Input
                id="nc-contact-email"
                type="email"
                placeholder="ex. marie@acme.fr"
                value={form.contactEmail}
                onChange={(e) => update('contactEmail', e.target.value)}
              />
            </FormField>

            <FormField label={t('clients.dialog.address')} htmlFor="nc-address-line1">
              <Input
                id="nc-address-line1"
                placeholder="ex. 42 rue de Rivoli"
                value={form.addressLine1}
                onChange={(e) => update('addressLine1', e.target.value)}
              />
            </FormField>

            <FormField label={t('clients.dialog.addressLine2')} htmlFor="nc-address-line2">
              <Input
                id="nc-address-line2"
                placeholder="ex. Bâtiment B, 3e étage"
                value={form.addressLine2}
                onChange={(e) => update('addressLine2', e.target.value)}
              />
            </FormField>

            <div className="grid grid-cols-3 gap-3">
              <FormField label={t('clients.dialog.postalCode')} htmlFor="nc-postal">
                <Input
                  id="nc-postal"
                  placeholder="75001"
                  value={form.postalCode}
                  onChange={(e) => update('postalCode', e.target.value)}
                />
              </FormField>

              <FormField label={t('clients.dialog.city')} htmlFor="nc-city">
                <Input
                  id="nc-city"
                  placeholder="Paris"
                  value={form.city}
                  onChange={(e) => update('city', e.target.value)}
                />
              </FormField>

              <FormField label={t('clients.dialog.country')} htmlFor="nc-country">
                <Input
                  id="nc-country"
                  maxLength={2}
                  placeholder="FR"
                  value={form.country}
                  onChange={(e) => update('country', e.target.value.toUpperCase())}
                />
              </FormField>
            </div>
          </VStack>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>{t('clients.dialog.cancel')}</Button>
            <Button type="submit" disabled={createClient.isPending}>
              {createClient.isPending ? t('clients.dialog.creating') : t('clients.dialog.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
