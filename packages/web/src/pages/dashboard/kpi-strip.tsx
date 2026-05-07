import { Activity, AlertTriangle, BarChart3, TrendingUp } from 'lucide-react'
import { KpiCard } from '@/components/shared/kpi-card'
import { KpiGrid } from '@/components/shared/layouts'
import { formatCurrency } from '@/lib/format'
import type { DashboardData } from '@/api/types'

interface KpiStripProps {
  kpis: DashboardData['kpis']
}

export function KpiStrip({ kpis }: KpiStripProps) {
  return (
    <KpiGrid>
      <KpiCard
        label="Valeur contractuelle totale"
        value={formatCurrency(kpis.totalContractValue)}
        description="Sur tous les devis validés"
        icon={<BarChart3 size={16} />}
      />
      <KpiCard
        label="Marge prévisionnelle totale"
        value={formatCurrency(kpis.totalMarginForecast)}
        description="D'après les derniers snapshots"
        icon={<TrendingUp size={16} />}
      />
      <KpiCard
        label="Projets en cours"
        value={String(kpis.activeProjects)}
        description="Actuellement en cours"
        icon={<Activity size={16} />}
      />
      <KpiCard
        label="Approbations en attente"
        value={String(kpis.overdueApprovals)}
        description="Feuilles de temps à approuver"
        icon={<AlertTriangle size={16} />}
      />
    </KpiGrid>
  )
}
