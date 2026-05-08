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
          <DialogTitle>Valider le devis</DialogTitle>
        </DialogHeader>
        <MutedText>
          Une fois validés, tous les TJM de vente pour chaque combinaison Tâche + Profil seront gelés
          et ne pourront plus être modifiés dans les avenants futurs. Confirmer ?
        </MutedText>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={onConfirm}>Confirmer la validation</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
