import { useState } from 'react'
import { Plus, Pencil } from 'lucide-react'
import { useReferenceData } from '@/api/hooks'
import { formatCurrency } from '@/lib/format'
import type { Profile } from '@/api/types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface ProfileFormState {
  name: string
  sellRate: string
  costRate: string
}

const emptyForm: ProfileFormState = {
  name: '',
  sellRate: '',
  costRate: '',
}

function computeMargin(sellRate: number, costRate: number): number {
  return sellRate - costRate
}

function computeMarginPct(sellRate: number, costRate: number): number {
  if (sellRate === 0) return 0
  return ((sellRate - costRate) / sellRate) * 100
}

export default function ProfilesPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null)
  const [form, setForm] = useState<ProfileFormState>(emptyForm)

  const { data: refData, isLoading, error } = useReferenceData()

  function openNew() {
    setEditingProfile(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEdit(profile: Profile) {
    setEditingProfile(profile)
    setForm({
      name: profile.name,
      sellRate: String(profile.defaultSellRatePerDay),
      costRate: String(profile.defaultCostRatePerDay),
    })
    setDialogOpen(true)
  }

  function handleClose() {
    setDialogOpen(false)
    setEditingProfile(null)
    setForm(emptyForm)
  }

  function handleSave() {
    // Mockup only — no persistence
    handleClose()
  }

  const dialogTitle = editingProfile ? 'Edit Profile' : 'New Profile'

  if (isLoading) return <div className="p-6">Loading...</div>
  if (error || !refData) return <div className="p-6">Error loading data</div>

  const { profiles } = refData

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Profiles</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Billing profiles with default day rates for quote creation.
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus />
          New Profile
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Profile Name</TableHead>
              <TableHead className="text-right">Default Sell Rate/Day</TableHead>
              <TableHead className="text-right">Default Cost Rate/Day</TableHead>
              <TableHead className="text-right">Default Margin/Day</TableHead>
              <TableHead className="text-right">Default Margin %</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles.map((profile) => {
              const margin = computeMargin(
                profile.defaultSellRatePerDay,
                profile.defaultCostRatePerDay,
              )
              const marginPct = computeMarginPct(
                profile.defaultSellRatePerDay,
                profile.defaultCostRatePerDay,
              )
              return (
                <TableRow key={profile.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium text-gray-900 py-3.5">
                    {profile.name}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-gray-700">
                    {formatCurrency(profile.defaultSellRatePerDay)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-gray-700">
                    {formatCurrency(profile.defaultCostRatePerDay)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-medium text-gray-900">
                    {formatCurrency(margin)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-gray-700">
                    {marginPct.toFixed(1)}%
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => openEdit(profile)}
                      aria-label={`Edit ${profile.name}`}
                    >
                      <Pencil />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Note */}
      <p className="text-xs text-gray-400">
        These are default rates for quote creation convenience. They do not affect validated quotes or project rates.
      </p>

      {/* Profile dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="profile-name">Profile Name</Label>
              <Input
                id="profile-name"
                placeholder="e.g. Senior Consultant"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sell-rate">Default Sell Rate / Day (EUR)</Label>
              <Input
                id="sell-rate"
                type="number"
                min={0}
                placeholder="e.g. 1200"
                value={form.sellRate}
                onChange={(e) => setForm((f) => ({ ...f, sellRate: e.target.value }))}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cost-rate">Default Cost Rate / Day (EUR)</Label>
              <Input
                id="cost-rate"
                type="number"
                min={0}
                placeholder="e.g. 550"
                value={form.costRate}
                onChange={(e) => setForm((f) => ({ ...f, costRate: e.target.value }))}
              />
            </div>

            {/* Live margin preview */}
            {form.sellRate && form.costRate && (
              <div className="rounded-md bg-gray-50 px-3 py-2 text-sm">
                <span className="text-gray-500">Computed margin: </span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(Number(form.sellRate) - Number(form.costRate))}
                </span>
                <span className="text-gray-400 mx-1">/day</span>
                <span className="font-semibold text-gray-900">
                  ({computeMarginPct(Number(form.sellRate), Number(form.costRate)).toFixed(1)}%)
                </span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!form.name.trim()}>
              {editingProfile ? 'Save Changes' : 'Create Profile'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
