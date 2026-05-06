import { useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useReferenceData, useCreateProfile, useUpdateProfile } from '@/api/hooks'
import type { Profile } from '@/api/types'
import { Button } from '@/components/ui/button'
import { LoadingState, ErrorState, PageContainer } from '@/components/shared/page-container'
import { FlexBetween } from '@/components/shared/layouts'
import { PageTitle } from '@/components/shared/page-title'
import { MutedText } from '@/components/shared/muted-text'
import { TextCaption } from '@/components/shared/text-caption'
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
  const createProfile = useCreateProfile()
  const updateProfile = useUpdateProfile()

  if (isLoading) return <LoadingState />
  if (error || !refData) return <ErrorState />

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
    const sellRate = parseFloat(form.sellRate)
    const costRate = parseFloat(form.costRate)
    if (!form.name.trim()) { toast.error('Name is required'); return }
    if (isNaN(sellRate) || sellRate < 0) { toast.error('Invalid sell rate'); return }
    if (isNaN(costRate) || costRate < 0) { toast.error('Invalid cost rate'); return }

    if (editingProfile) {
      updateProfile.mutate(
        { id: editingProfile.id, name: form.name, defaultSellRatePerDay: sellRate, defaultCostRatePerDay: costRate },
        {
          onSuccess: () => { toast.success(`Profile "${form.name}" updated`); closeDialog() },
          onError: () => toast.error('Failed to update profile'),
        },
      )
    } else {
      createProfile.mutate(
        { name: form.name, defaultSellRatePerDay: sellRate, defaultCostRatePerDay: costRate },
        {
          onSuccess: () => { toast.success(`Profile "${form.name}" created`); closeDialog() },
          onError: () => toast.error('Failed to create profile'),
        },
      )
    }
  }

  return (
    <PageContainer size="md">
      <FlexBetween>
        <div>
          <PageTitle>Profiles</PageTitle>
          <MutedText spacing="tight">Billing profiles with default day rates for quote creation.</MutedText>
        </div>
        <Button onClick={openNew}>
          <Plus />
          New Profile
        </Button>
      </FlexBetween>

      <ProfilesTable profiles={refData.profiles} onEdit={openEdit} />

      <TextCaption>
        These are default rates for quote creation convenience. They do not affect validated
        quotes or project rates.
      </TextCaption>

      <ProfileFormDialog
        open={dialogOpen}
        title={editingProfile ? 'Edit Profile' : 'New Profile'}
        form={form}
        onChange={setForm}
        onClose={closeDialog}
        onSave={handleSave}
        saveLabel={editingProfile ? 'Save Changes' : 'Create Profile'}
        isPending={createProfile.isPending || updateProfile.isPending}
      />
    </PageContainer>
  )
}
