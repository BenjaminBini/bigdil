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

export type QuoteAction = 'send' | 'reject' | 'reopen' | 'unvalidate'

interface QuoteActionDialogProps {
  action: QuoteAction
  open: boolean
  onConfirm: () => void
  onClose: () => void
}

const DIALOG_KEY: Record<QuoteAction, 'sendDialog' | 'rejectDialog' | 'reopenDialog' | 'unvalidateDialog'> = {
  send: 'sendDialog',
  reject: 'rejectDialog',
  reopen: 'reopenDialog',
  unvalidate: 'unvalidateDialog',
}

export function QuoteActionDialog({ action, open, onConfirm, onClose }: QuoteActionDialogProps) {
  const { t } = useTranslation(['pages', 'common'])
  const key = DIALOG_KEY[action]
  const isDestructive = action === 'reject' || action === 'unvalidate'
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{t(`pages:quotes.${key}.title`)}</DialogTitle>
        </DialogHeader>
        <MutedText>
          {t(`pages:quotes.${key}.description`)}
        </MutedText>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t('common:actions.cancel')}</Button>
          <Button variant={isDestructive ? 'destructive' : 'default'} onClick={onConfirm}>
            {t(`pages:quotes.${key}.confirm`)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
