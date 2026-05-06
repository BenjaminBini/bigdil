import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useCreateQuote } from '@/api/hooks'
import type { Task, Profile } from '@/api/types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/shared/form-field'
import { VStack } from '@/components/shared/VStack'

interface LineState {
  key: string
  taskId: string
  profileId: string
  days: string
  sellRatePerDay: string
  costRateAssumptionPerDay: string
}

function emptyLine(): LineState {
  return {
    key: crypto.randomUUID(),
    taskId: '',
    profileId: '',
    days: '',
    sellRatePerDay: '',
    costRateAssumptionPerDay: '',
  }
}

interface NewQuoteDialogProps {
  open: boolean
  onClose: () => void
  projectId: string
  tasks: Task[]
  profiles: Profile[]
}

export function NewQuoteDialog({ open, onClose, projectId, tasks, profiles }: NewQuoteDialogProps) {
  const [title, setTitle] = useState('')
  const [effectiveAt, setEffectiveAt] = useState('')
  const [lines, setLines] = useState<LineState[]>([emptyLine()])

  const createQuote = useCreateQuote(projectId)

  const phases = tasks.filter(t => !t.parentTaskId)
  const childTasks = tasks.filter(t => !!t.parentTaskId)

  function handleClose() {
    setTitle('')
    setEffectiveAt('')
    setLines([emptyLine()])
    onClose()
  }

  function setLineField(key: string, field: keyof LineState, value: string) {
    setLines(prev => prev.map(l => l.key === key ? { ...l, [field]: value } : l))
  }

  function handleProfileChange(key: string, profileId: string) {
    const profile = profiles.find(p => p.id === profileId)
    setLines(prev => prev.map(l =>
      l.key === key
        ? {
            ...l,
            profileId,
            sellRatePerDay: profile ? String(profile.defaultSellRatePerDay) : l.sellRatePerDay,
            costRateAssumptionPerDay: profile ? String(profile.defaultCostRatePerDay) : l.costRateAssumptionPerDay,
          }
        : l,
    ))
  }

  function addLine() {
    setLines(prev => [...prev, emptyLine()])
  }

  function removeLine(key: string) {
    setLines(prev => prev.filter(l => l.key !== key))
  }

  function handleCreate() {
    if (!title.trim()) { toast.error('Title is required'); return }
    if (lines.length === 0) { toast.error('At least one line is required'); return }
    for (const line of lines) {
      if (!line.taskId) { toast.error('All lines require a task'); return }
      if (!line.profileId) { toast.error('All lines require a profile'); return }
      if (!line.days || Number(line.days) <= 0) { toast.error('All lines require a positive number of days'); return }
      if (line.sellRatePerDay === '' || Number(line.sellRatePerDay) < 0) { toast.error('Invalid sell rate'); return }
      if (line.costRateAssumptionPerDay === '' || Number(line.costRateAssumptionPerDay) < 0) { toast.error('Invalid cost rate'); return }
    }

    createQuote.mutate(
      {
        title: title.trim(),
        effectiveAt: effectiveAt || null,
        lines: lines.map(l => ({
          taskId: l.taskId,
          profileId: l.profileId,
          days: Number(l.days),
          sellRatePerDay: Number(l.sellRatePerDay),
          costRateAssumptionPerDay: Number(l.costRateAssumptionPerDay),
        })),
      },
      {
        onSuccess: () => {
          toast.success('Quote created')
          handleClose()
        },
        onError: () => toast.error('Failed to create quote'),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
      <DialogContent size="xl" scrollable>
        <DialogHeader>
          <DialogTitle>New Quote</DialogTitle>
        </DialogHeader>

        <VStack gap="xl">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Title" htmlFor="nq-title">
              <Input
                id="nq-title"
                placeholder="e.g. Initial Scope"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </FormField>
            <FormField label="Effective Date" htmlFor="nq-effective">
              <Input
                id="nq-effective"
                type="date"
                value={effectiveAt}
                onChange={e => setEffectiveAt(e.target.value)}
              />
            </FormField>
          </div>

          <div>
            <div className="mb-2 text-sm font-medium">Lines</div>
            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_160px_80px_100px_100px_36px] gap-2 px-1">
                {['Task', 'Profile', 'Days', 'Sell Rate/Day', 'Cost Rate/Day', ''].map((h, i) => (
                  <span key={i} className="text-xs font-medium text-muted-foreground">{h}</span>
                ))}
              </div>

              {lines.map(line => (
                <div key={line.key} className="grid grid-cols-[1fr_160px_80px_100px_100px_36px] gap-2 items-center">
                  <Select value={line.taskId} onValueChange={v => setLineField(line.key, 'taskId', v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select task…" />
                    </SelectTrigger>
                    <SelectContent>
                      {phases.map(phase => {
                        const kids = childTasks.filter(c => c.parentTaskId === phase.id)
                        return kids.length > 0 ? (
                          <SelectGroup key={phase.id}>
                            <SelectLabel>{phase.name}</SelectLabel>
                            {kids.map(task => (
                              <SelectItem key={task.id} value={task.id}>{task.name}</SelectItem>
                            ))}
                          </SelectGroup>
                        ) : (
                          <SelectItem key={phase.id} value={phase.id}>{phase.name}</SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>

                  <Select value={line.profileId} onValueChange={v => handleProfileChange(line.key, v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Profile…" />
                    </SelectTrigger>
                    <SelectContent>
                      {profiles.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="0"
                    value={line.days}
                    onChange={e => setLineField(line.key, 'days', e.target.value)}
                  />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={line.sellRatePerDay}
                    onChange={e => setLineField(line.key, 'sellRatePerDay', e.target.value)}
                  />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={line.costRateAssumptionPerDay}
                    onChange={e => setLineField(line.key, 'costRateAssumptionPerDay', e.target.value)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLine(line.key)}
                    disabled={lines.length === 1}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
            </div>

            <Button variant="outline" size="sm" className="mt-3" onClick={addLine}>
              <Plus size={14} />
              Add Line
            </Button>
          </div>
        </VStack>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleCreate} disabled={createQuote.isPending}>
            {createQuote.isPending ? 'Creating…' : 'Create Quote'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
