import { Link, useParams } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'
import { KpiCard } from '@/components/shared/kpi-card'
import { LoadingState, ErrorState, PageContainer } from '@/components/shared/page-container'
import { FlexRow } from '@/components/shared/layouts'
import { useProfile } from '@/api/hooks'
import { formatCurrency } from '@/lib/format'
import { AppliedRatesCard } from './profile-detail/applied-rates-card'
import { ProfileAssignmentsCard } from './profile-detail/assignments-card'
import { QuoteUsageCard } from './profile-detail/quote-usage-card'

export default function ProfileDetailPage() {
  const { id } = useParams()
  const { data, isLoading, error } = useProfile(id!)

  if (isLoading) return <LoadingState />
  if (error || !data) return <ErrorState message="Error loading profile" />

  const defaultMargin = data.defaultSellRatePerDay - data.defaultCostRatePerDay
  const defaultMarginPct = data.defaultSellRatePerDay > 0 ? ((defaultMargin / data.defaultSellRatePerDay) * 100).toFixed(1) : '0'

  return (
    <PageContainer size="full">
      <FlexRow>
        <Link to="/profiles">
          <Button variant="ghost" size="icon">
            <ArrowLeft size={16} />
          </Button>
        </Link>
        <PageHeader title={data.name} subtitle={`Profile ID: ${data.id}`} />
      </FlexRow>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <KpiCard label="Default Sell Rate" value={`${formatCurrency(data.defaultSellRatePerDay)}/day`} />
        <KpiCard label="Default Cost Rate" value={`${formatCurrency(data.defaultCostRatePerDay)}/day`} />
        <KpiCard label="Default Margin" value={`${formatCurrency(defaultMargin)}/day (${defaultMarginPct}%)`} />
      </div>

      <QuoteUsageCard usage={data.usage} />
      <ProfileAssignmentsCard assignments={data.activeAssignments} />
      <AppliedRatesCard rates={data.appliedRates} />
    </PageContainer>
  )
}
