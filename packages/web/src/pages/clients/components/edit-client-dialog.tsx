import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
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

function formFromClient(client: Client): FormState {
  return {
    name: client.name,
    contactName: client.contactName,
    contactEmail: client.contactEmail,
    addressLine1: client.addressLine1,
    addressLine2: client.addressLine2 ?? '',
    postalCode: client.postalCode,
    city: client.city,
    country: client.country,
  }
}

export function EditClientDialog({ client, open, onClose }: EditClientDialogProps) {
  const { t } = useTranslation('pages')
  const [form, setForm] = useState<FormState>(() => formFromClient(client))
  const updateClient = useUpdateClient()

  useEffect(() => {
    if (open) setForm(formFromClient(client))
  }, [open, client])

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleSave() {
    if (!form.name.trim()) { toast.error(t('clients.dialog.nameRequired')); return }
    if (!form.contactName.trim()) { toast.error(t('clients.dialog.contactNameRequired')); return }
    if (!form.contactEmail.trim()) { toast.error(t('clients.dialog.contactEmailRequired')); return }
    if (!form.addressLine1.trim()) { toast.error(t('clients.dialog.addressRequired')); return }
    if (!form.postalCode.trim()) { toast.error(t('clients.dialog.postalRequired')); return }
    if (!form.city.trim()) { toast.error(t('clients.dialog.cityRequired')); return }
    if (!form.country.trim()) { toast.error(t('clients.dialog.countryRequired')); return }

    updateClient.mutate(
      {
        id: client.id,
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
        onSuccess: () => {
          toast.success(t('clients.dialog.updatedToast', { name: form.name.trim() }))
          onClose()
        },
        onError: () => toast.error(t('clients.dialog.updateFailed')),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent size="sm">
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave() }}>
          <DialogHeader>
            <DialogTitle>{t('clients.dialog.editTitle')}</DialogTitle>
          </DialogHeader>

          <VStack gap="xl">
            <FormField label={t('clients.dialog.companyName')} htmlFor="ec-name">
              <Input
                id="ec-name"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
              />
            </FormField>

            <FormField label={t('clients.dialog.contactName')} htmlFor="ec-contact-name">
              <Input
                id="ec-contact-name"
                value={form.contactName}
                onChange={(e) => update('contactName', e.target.value)}
              />
            </FormField>

            <FormField label={t('clients.dialog.contactEmail')} htmlFor="ec-contact-email">
              <Input
                id="ec-contact-email"
                type="email"
                value={form.contactEmail}
                onChange={(e) => update('contactEmail', e.target.value)}
              />
            </FormField>

            <FormField label={t('clients.dialog.address')} htmlFor="ec-address-line1">
              <Input
                id="ec-address-line1"
                value={form.addressLine1}
                onChange={(e) => update('addressLine1', e.target.value)}
              />
            </FormField>

            <FormField label={t('clients.dialog.addressLine2')} htmlFor="ec-address-line2">
              <Input
                id="ec-address-line2"
                value={form.addressLine2}
                onChange={(e) => update('addressLine2', e.target.value)}
              />
            </FormField>

            <div className="grid grid-cols-3 gap-3">
              <FormField label={t('clients.dialog.postalCode')} htmlFor="ec-postal">
                <Input
                  id="ec-postal"
                  value={form.postalCode}
                  onChange={(e) => update('postalCode', e.target.value)}
                />
              </FormField>

              <FormField label={t('clients.dialog.city')} htmlFor="ec-city">
                <Input
                  id="ec-city"
                  value={form.city}
                  onChange={(e) => update('city', e.target.value)}
                />
              </FormField>

              <FormField label={t('clients.dialog.country')} htmlFor="ec-country">
                <Input
                  id="ec-country"
                  maxLength={2}
                  value={form.country}
                  onChange={(e) => update('country', e.target.value.toUpperCase())}
                />
              </FormField>
            </div>
          </VStack>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>{t('clients.dialog.cancel')}</Button>
            <Button type="submit" disabled={updateClient.isPending}>
              {updateClient.isPending ? t('clients.dialog.saving') : t('clients.dialog.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
