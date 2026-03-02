import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCurrency } from '@/lib/format'
import { computeMarginPct } from './profile-math'

export interface ProfileFormState {
  name: string
  sellRate: string
  costRate: string
}

interface ProfileFormDialogProps {
  open: boolean
  title: string
  form: ProfileFormState
  onChange: (next: ProfileFormState) => void
  onClose: () => void
  onSave: () => void
  saveLabel: string
}

export function ProfileFormDialog({
  open,
  title,
  form,
  onChange,
  onClose,
  onSave,
  saveLabel,
}: ProfileFormDialogProps) {
  const hasPreview = Boolean(form.sellRate) && Boolean(form.costRate)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <Field label="Profile Name" htmlFor="profile-name">
            <Input
              id="profile-name"
              placeholder="e.g. Senior Consultant"
              value={form.name}
              onChange={(event) => onChange({ ...form, name: event.target.value })}
            />
          </Field>

          <Field label="Default Sell Rate / Day (EUR)" htmlFor="sell-rate">
            <Input
              id="sell-rate"
              type="number"
              min={0}
              placeholder="e.g. 1200"
              value={form.sellRate}
              onChange={(event) => onChange({ ...form, sellRate: event.target.value })}
            />
          </Field>

          <Field label="Default Cost Rate / Day (EUR)" htmlFor="cost-rate">
            <Input
              id="cost-rate"
              type="number"
              min={0}
              placeholder="e.g. 550"
              value={form.costRate}
              onChange={(event) => onChange({ ...form, costRate: event.target.value })}
            />
          </Field>

          {hasPreview && (
            <div className="rounded-md bg-gray-50 px-3 py-2 text-sm">
              <span className="text-gray-500">Computed margin: </span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(Number(form.sellRate) - Number(form.costRate))}
              </span>
              <span className="mx-1 text-gray-400">/day</span>
              <span className="font-semibold text-gray-900">
                ({computeMarginPct(Number(form.sellRate), Number(form.costRate)).toFixed(1)}%)
              </span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onSave} disabled={!form.name.trim()}>{saveLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface FieldProps {
  label: string
  htmlFor: string
  children: React.ReactNode
}

function Field({ label, htmlFor, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  )
}
