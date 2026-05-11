import type { ReactNode } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FormField } from '@/components/shared/form-field'
import type { TaskStatus } from '@/api/types'

function DialogBody({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-4 py-2">{children}</div>
}

export interface TaskFormState {
  name: string
  description: string
  status: TaskStatus
}

interface TaskDialogProps {
  open: boolean
  title: string
  form: TaskFormState
  onChange: (form: TaskFormState) => void
  onSave: () => void
  onClose: () => void
  isPending?: boolean
  hideStatus?: boolean
}

export function TaskDialog({ open, title, form, onChange, onSave, onClose, isPending, hideStatus }: TaskDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent size="sm">
        <form onSubmit={(e) => { e.preventDefault(); if (form.name.trim() && !isPending) onSave() }}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <DialogBody>
          <FormField label="Name" htmlFor="task-name">
            <Input
              id="task-name"
              placeholder="e.g. Requirements Gathering"
              value={form.name}
              onChange={(e) => onChange({ ...form, name: e.target.value })}
            />
          </FormField>

          <FormField label="Description" htmlFor="task-description">
            <Textarea
              id="task-description"
              placeholder="Optional description..."
              rows={3}
              value={form.description}
              onChange={(e) => onChange({ ...form, description: e.target.value })}
            />
          </FormField>

          {!hideStatus && (
            <FormField label="Status" htmlFor="task-status">
              <Select
                value={form.status}
                onValueChange={(v) => onChange({ ...form, status: v as TaskStatus })}
              >
                <SelectTrigger id="task-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          )}
        </DialogBody>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!form.name.trim() || isPending}>
            {isPending ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
