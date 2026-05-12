import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { MutedText } from '@/components/shared/muted-text'

interface CancelQuoteDialogProps {
  open: boolean
  onConfirm: () => void
  onClose: () => void
}

export function CancelQuoteDialog({ open, onConfirm, onClose }: CancelQuoteDialogProps) {
  const { t } = useTranslation(['pages', 'common'])
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{t('pages:quotes.cancelDialog.title')}</DialogTitle>
        </DialogHeader>
        <MutedText>
          {t('pages:quotes.cancelDialog.description')}
        </MutedText>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t('common:actions.back')}</Button>
          <Button onClick={onConfirm}>{t('pages:quotes.cancelDialog.confirm')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
