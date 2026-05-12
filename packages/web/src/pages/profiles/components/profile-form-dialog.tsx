import type { ReactNode } from 'react'
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
import { formatCurrency } from '@/lib/format'
import { computeMarginPct } from './profile-math'

function MarginPreview({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-md bg-gray-50 px-3 py-2 text-sm">{children}</div>
  )
}

function DialogBody({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-4 py-2">{children}</div>
}

function MarginLabel({ children }: { children: ReactNode }) {
  return <span className="text-gray-500">{children}</span>
}

function MarginAmount({ children }: { children: ReactNode }) {
  return <span className="font-semibold text-gray-900">{children}</span>
}

function MarginUnit({ children }: { children: ReactNode }) {
  return <span className="mx-1 text-gray-400">{children}</span>
}

function MarginPctDisplay({ children }: { children: ReactNode }) {
  return <span className="font-semibold text-gray-900">{children}</span>
}

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
  isPending?: boolean
}

export function ProfileFormDialog({
  open,
  title,
  form,
  onChange,
  onClose,
  onSave,
  saveLabel,
  isPending,
}: ProfileFormDialogProps) {
  const hasPreview = Boolean(form.sellRate) && Boolean(form.costRate)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent size="sm">
        <form onSubmit={(event) => { event.preventDefault(); if (form.name.trim() && !isPending) onSave() }}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <DialogBody>
          <FormField label="Profile Name" htmlFor="profile-name">
            <Input
              id="profile-name"
              placeholder="e.g. Senior Consultant"
              value={form.name}
              onChange={(event) => onChange({ ...form, name: event.target.value })}
            />
          </FormField>

          <FormField label="Default Sell Rate / Day (EUR)" htmlFor="sell-rate">
            <Input
              id="sell-rate"
              type="number"
              min={0}
              placeholder="e.g. 1200"
              value={form.sellRate}
              onChange={(event) => onChange({ ...form, sellRate: event.target.value })}
            />
          </FormField>

          <FormField label="Default Cost Rate / Day (EUR)" htmlFor="cost-rate">
            <Input
              id="cost-rate"
              type="number"
              min={0}
              placeholder="e.g. 550"
              value={form.costRate}
              onChange={(event) => onChange({ ...form, costRate: event.target.value })}
            />
          </FormField>

          {hasPreview && (
            <MarginPreview>
              <MarginLabel>Computed margin: </MarginLabel>
              <MarginAmount>
                {formatCurrency(Number(form.sellRate) - Number(form.costRate))}
              </MarginAmount>
              <MarginUnit>/day</MarginUnit>
              <MarginPctDisplay>
                ({computeMarginPct(Number(form.sellRate), Number(form.costRate)).toFixed(1)}%)
              </MarginPctDisplay>
            </MarginPreview>
          )}
        </DialogBody>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={!form.name.trim() || isPending}>
            {isPending ? 'Saving…' : saveLabel}
          </Button>
        </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
