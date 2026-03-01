import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ValidateDialogProps {
  open: boolean
  onConfirm: () => void
  onClose: () => void
}

export function ValidateDialog({ open, onConfirm, onClose }: ValidateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Validate Quote</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-600 py-2">
          Once validated, all sell rates for Task + Profile combinations will be frozen
          and cannot be changed in future change orders. Are you sure?
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onConfirm}>Confirm Validation</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
