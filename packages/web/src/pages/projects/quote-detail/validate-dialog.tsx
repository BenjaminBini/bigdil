import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { MutedText } from '@/components/shared/muted-text'

interface ValidateDialogProps {
  open: boolean
  onConfirm: () => void
  onClose: () => void
}

export function ValidateDialog({ open, onConfirm, onClose }: ValidateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Validate Quote</DialogTitle>
        </DialogHeader>
        <MutedText>
          Once validated, all sell rates for Task + Profile combinations will be frozen
          and cannot be changed in future change orders. Are you sure?
        </MutedText>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onConfirm}>Confirm Validation</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
