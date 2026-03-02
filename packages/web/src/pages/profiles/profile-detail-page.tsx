import { Link, useParams } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'
import { KpiCard } from '@/components/shared/kpi-card'
import { useProfile } from '@/api/hooks'
import { formatCurrency } from '@/lib/format'
import { AppliedRatesCard } from './profile-detail/applied-rates-card'
import { ProfileAssignmentsCard } from './profile-detail/assignments-card'
import { QuoteUsageCard } from './profile-detail/quote-usage-card'

export default function ProfileDetailPage() {
  const { id } = useParams()
  const { data, isLoading, error } = useProfile(id!)

  if (isLoading) return <div className="p-6">Loading profile...</div>
  if (error || !data) return <div className="p-6">Error loading profile</div>

  const defaultMargin = data.defaultSellRatePerDay - data.defaultCostRatePerDay
  const defaultMarginPct = data.defaultSellRatePerDay > 0 ? ((defaultMargin / data.defaultSellRatePerDay) * 100).toFixed(1) : '0'

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Link to="/profiles">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <PageHeader title={data.name} subtitle={`Profile ID: ${data.id}`} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <KpiCard label="Default Sell Rate" value={`${formatCurrency(data.defaultSellRatePerDay)}/day`} />
        <KpiCard label="Default Cost Rate" value={`${formatCurrency(data.defaultCostRatePerDay)}/day`} />
        <KpiCard label="Default Margin" value={`${formatCurrency(defaultMargin)}/day (${defaultMarginPct}%)`} />
      </div>

      <QuoteUsageCard usage={data.usage} />
      <ProfileAssignmentsCard assignments={data.activeAssignments} />
      <AppliedRatesCard rates={data.appliedRates} />
    </div>
  )
}
