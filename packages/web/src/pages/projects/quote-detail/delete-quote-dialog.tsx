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

interface DeleteQuoteDialogProps {
  open: boolean
  onConfirm: () => void
  onClose: () => void
}

export function DeleteQuoteDialog({ open, onConfirm, onClose }: DeleteQuoteDialogProps) {
  const { t } = useTranslation(['pages', 'common'])
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{t('pages:quotes.deleteDialog.title')}</DialogTitle>
        </DialogHeader>
        <MutedText>
          {t('pages:quotes.deleteDialog.description')}
        </MutedText>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t('common:actions.cancel')}</Button>
          <Button variant="destructive" onClick={onConfirm}>{t('pages:quotes.deleteDialog.confirm')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
