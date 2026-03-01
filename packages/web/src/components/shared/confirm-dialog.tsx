import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Dialog title */
  title?: string
  /** Descriptive message body */
  description?: string
  /** Label for the confirm button (default: "Confirm") */
  confirmLabel?: string
  /** Label for the cancel button (default: "Cancel") */
  cancelLabel?: string
  /** When true the confirm button is styled destructively */
  destructive?: boolean
  /** Called when the user clicks the confirm button */
  onConfirm: () => void
}

/**
 * A reusable confirmation dialog backed by shadcn's Dialog primitives.
 *
 * Usage:
 *   const [open, setOpen] = useState(false)
 *   <ConfirmDialog
 *     open={open}
 *     onOpenChange={setOpen}
 *     title="Delete project?"
 *     description="This action cannot be undone."
 *     destructive
 *     onConfirm={() => handleDelete()}
 *   />
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
}: ConfirmDialogProps) {
  function handleConfirm() {
    onConfirm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? 'destructive' : 'default'}
            onClick={handleConfirm}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
