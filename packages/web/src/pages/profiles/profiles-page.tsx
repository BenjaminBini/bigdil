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
    if (!form.name.trim()) { toast.error('Le nom est requis'); return }
    if (isNaN(sellRate) || sellRate < 0) { toast.error('Taux de vente invalide'); return }
    if (isNaN(costRate) || costRate < 0) { toast.error('Taux de coût invalide'); return }

    if (editingProfile) {
      updateProfile.mutate(
        { id: editingProfile.id, name: form.name, defaultSellRatePerDay: sellRate, defaultCostRatePerDay: costRate },
        {
          onSuccess: () => { toast.success(`Profil "${form.name}" mis à jour`); closeDialog() },
          onError: () => toast.error('Échec de la mise à jour du profil'),
        },
      )
    } else {
      createProfile.mutate(
        { name: form.name, defaultSellRatePerDay: sellRate, defaultCostRatePerDay: costRate },
        {
          onSuccess: () => { toast.success(`Profil "${form.name}" créé`); closeDialog() },
          onError: () => toast.error('Échec de la création du profil'),
        },
      )
    }
  }

  return (
    <PageContainer size="md">
      <FlexBetween>
        <div>
          <PageTitle>Profils</PageTitle>
          <MutedText spacing="tight">Profils de facturation avec taux journaliers par défaut pour la création des devis.</MutedText>
        </div>
        <Button onClick={openNew}>
          <Plus />
          Nouveau profil
        </Button>
      </FlexBetween>

      <ProfilesTable profiles={refData.profiles} onEdit={openEdit} />

      <TextCaption>
        Ces taux sont des valeurs par défaut pour faciliter la création de devis. Ils ne modifient pas les devis validés ni les taux appliqués aux projets.
      </TextCaption>

      <ProfileFormDialog
        open={dialogOpen}
        title={editingProfile ? 'Modifier le profil' : 'Nouveau profil'}
        form={form}
        onChange={setForm}
        onClose={closeDialog}
        onSave={handleSave}
        saveLabel={editingProfile ? 'Enregistrer' : 'Créer le profil'}
        isPending={createProfile.isPending || updateProfile.isPending}
      />
    </PageContainer>
  )
}
