import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useReferenceData } from '@/api/hooks'
import type { Profile } from '@/api/types'
import { Button } from '@/components/ui/button'
import {
  ProfileFormDialog,
  type ProfileFormState,
} from './components/profile-form-dialog'
import { ProfilesTable } from './components/profiles-table'

const emptyForm: ProfileFormState = {
  name: '',
  sellRate: '',
  costRate: '',
}

export default function ProfilesPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null)
  const [form, setForm] = useState<ProfileFormState>(emptyForm)

  const { data: refData, isLoading, error } = useReferenceData()

  if (isLoading) return <div className="p-6">Loading...</div>
  if (error || !refData) return <div className="p-6">Error loading data</div>

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

  function closeDialog() {
    setDialogOpen(false)
    setEditingProfile(null)
    setForm(emptyForm)
  }

  function handleSave() {
    closeDialog()
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Profiles</h1>
          <p className="mt-0.5 text-sm text-gray-500">Billing profiles with default day rates for quote creation.</p>
        </div>
        <Button onClick={openNew}>
          <Plus />
          New Profile
        </Button>
      </div>

      <ProfilesTable profiles={refData.profiles} onEdit={openEdit} />

      <p className="text-xs text-gray-400">
        These are default rates for quote creation convenience. They do not affect validated
        quotes or project rates.
      </p>

      <ProfileFormDialog
        open={dialogOpen}
        title={editingProfile ? 'Edit Profile' : 'New Profile'}
        form={form}
        onChange={setForm}
        onClose={closeDialog}
        onSave={handleSave}
        saveLabel={editingProfile ? 'Save Changes' : 'Create Profile'}
      />
    </div>
  )
}
