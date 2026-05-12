import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { MutedText } from '@/components/shared/muted-text'
import { FormField } from '@/components/shared/form-field'
import { VStack } from '@/components/shared/VStack'

interface ValidateDialogProps {
  open: boolean
  defaultEffectiveAt: string
  onConfirm: (effectiveAt: string) => void
  onClose: () => void
}

export function ValidateDialog({ open, defaultEffectiveAt, onConfirm, onClose }: ValidateDialogProps) {
  const { t } = useTranslation(['pages', 'common', 'forms'])
  const [effectiveAt, setEffectiveAt] = useState(defaultEffectiveAt)

  useEffect(() => {
    if (open) setEffectiveAt(defaultEffectiveAt)
  }, [open, defaultEffectiveAt])

  const canConfirm = effectiveAt.trim().length > 0

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{t('pages:quotes.validateDialog.title')}</DialogTitle>
        </DialogHeader>
        <VStack>
          <MutedText>
            {t('pages:quotes.validateDialog.description')}
          </MutedText>
          <FormField label={t('forms:fields.effectiveDate')} htmlFor="validate-effective-at">
            <Input
              id="validate-effective-at"
              type="date"
              value={effectiveAt}
              onChange={(e) => setEffectiveAt(e.target.value)}
              required
            />
          </FormField>
        </VStack>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t('common:actions.cancel')}</Button>
          <Button onClick={() => onConfirm(effectiveAt)} disabled={!canConfirm}>
            {t('pages:quotes.validateDialog.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
