import { useState } from 'react'
import { Plus, IdCard } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useReferenceData, useCreateProfile, useUpdateProfile, useDeleteProfile } from '@/api/hooks'
import { ApiError } from '@/api/client'
import type { Profile } from '@/api/types'
import { Button } from '@/components/ui/button'
import { LoadingState, ErrorState, PageContainer } from '@/components/shared/page-container'
import { EmptyState } from '@/components/shared/empty-state'
import { FlexBetween } from '@/components/shared/layouts'
import { PageTitle } from '@/components/shared/page-title'
import { MutedText } from '@/components/shared/muted-text'
import { TextCaption } from '@/components/shared/text-caption'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
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
  const { t } = useTranslation('pages')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null)
  const [form, setForm] = useState<ProfileFormState>(emptyForm)
  const [deleteTarget, setDeleteTarget] = useState<Profile | null>(null)

  const { data: refData, isLoading, error } = useReferenceData()
  const createProfile = useCreateProfile()
  const updateProfile = useUpdateProfile()
  const deleteProfile = useDeleteProfile()

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
    if (!form.name.trim()) { toast.error(t('profiles.validation.nameRequired')); return }
    if (isNaN(sellRate) || sellRate < 0) { toast.error(t('profiles.validation.sellRateInvalid')); return }
    if (isNaN(costRate) || costRate < 0) { toast.error(t('profiles.validation.costRateInvalid')); return }

    if (editingProfile) {
      updateProfile.mutate(
        { id: editingProfile.id, name: form.name, defaultSellRatePerDay: sellRate, defaultCostRatePerDay: costRate },
        {
          onSuccess: () => { toast.success(t('profiles.toasts.updateSuccess', { name: form.name })); closeDialog() },
          onError: () => toast.error(t('profiles.toasts.updateFailed')),
        },
      )
    } else {
      createProfile.mutate(
        { name: form.name, defaultSellRatePerDay: sellRate, defaultCostRatePerDay: costRate },
        {
          onSuccess: () => { toast.success(t('profiles.toasts.createSuccess', { name: form.name })); closeDialog() },
          onError: () => toast.error(t('profiles.toasts.createFailed')),
        },
      )
    }
  }

  return (
    <PageContainer size="md">
      <FlexBetween>
        <div>
          <PageTitle>{t('profiles.title')}</PageTitle>
          <MutedText spacing="tight">{t('profiles.subtitle')}</MutedText>
        </div>
        <Button onClick={openNew}>
          <Plus />
          {t('profiles.newProfile')}
        </Button>
      </FlexBetween>

      {refData.profiles.length === 0 ? (
        <EmptyState
          icon={IdCard}
          title={t('profiles.empty')}
          description={t('profiles.emptyDescription')}
          action={
            <Button onClick={openNew}>
              <Plus />
              {t('profiles.createFirst')}
            </Button>
          }
        />
      ) : (
        <ProfilesTable profiles={refData.profiles} onEdit={openEdit} onDelete={setDeleteTarget} />
      )}

      <TextCaption>
        {t('profiles.footer')}
      </TextCaption>

      <ProfileFormDialog
        open={dialogOpen}
        title={editingProfile ? t('profiles.dialog.editTitle') : t('profiles.dialog.newTitle')}
        form={form}
        onChange={setForm}
        onClose={closeDialog}
        onSave={handleSave}
        saveLabel={editingProfile ? t('profiles.saveLabel') : t('profiles.createLabel')}
        isPending={createProfile.isPending || updateProfile.isPending}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        title={t('profiles.deleteTitle', { name: deleteTarget?.name ?? '' })}
        description={t('profiles.deleteDescription')}
        confirmLabel={t('profiles.deleteConfirm')}
        cancelLabel={t('profiles.deleteCancel')}
        destructive
        onConfirm={() => {
          if (!deleteTarget) return
          const target = deleteTarget
          deleteProfile.mutate(target.id, {
            onSuccess: () => {
              toast.success(t('profiles.deleteSuccess', { name: target.name }))
              setDeleteTarget(null)
            },
            onError: (err: unknown) => {
              const message = err instanceof ApiError && err.status === 409
                ? t('profiles.deleteConflict')
                : t('profiles.deleteFailed')
              toast.error(message)
              setDeleteTarget(null)
            },
          })
        }}
      />
    </PageContainer>
  )
}
