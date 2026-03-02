import { useParams } from 'react-router'
import { toast } from 'sonner'
import { Download } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSnapshot, useProject, useProjectTimesheets, useReferenceData } from '@/api/hooks'
import { formatCurrency, formatDate } from '@/lib/format'
import { MetricsTab } from './snapshot-detail/metrics-tab'
import { ScopeTab } from './snapshot-detail/scope-tab'
import { WorkTableTab } from './snapshot-detail/work-table-tab'
import { ActualsTab } from './snapshot-detail/actuals-tab'

export default function SnapshotDetailPage() {
  const { id: projectId, snapshotId } = useParams()

  const { data: snapshot, isLoading: snapLoading, error: snapError } = useSnapshot(projectId!, snapshotId!)
  const { data: project, isLoading: projectLoading, error: projectError } = useProject(projectId!)
  const { data: refData, isLoading: refLoading, error: refError } = useReferenceData()
  const { data: allTimesheets, isLoading: tsLoading, error: tsError } = useProjectTimesheets(projectId!)

  const isLoading = snapLoading || projectLoading || refLoading || tsLoading
  const hasError = snapError || projectError || refError || tsError

  if (isLoading) return <div className="p-6">Loading...</div>
  if (hasError || !snapshot || !project || !refData || !allTimesheets) {
    return (
      <div className="p-6 text-center text-gray-400">
        Snapshot not found.
      </div>
    )
  }

  const getTaskName = (taskId: string) => project.flatTasks.find(t => t.id === taskId)?.name ?? taskId
  const getProfileName = (profileId: string) => refData.profiles.find(p => p.id === profileId)?.name ?? profileId
  const getEmployeeName = (employeeId: string | null) =>
    employeeId ? (refData.employees.find(e => e.id === employeeId)?.name ?? employeeId) : '—'

  function handleExport() {
    toast.info('Exporting CSV bundle…')
  }

  const marginPct =
    snapshot.metrics && snapshot.metrics.contractValue > 0
      ? (snapshot.metrics.marginForecast / snapshot.metrics.contractValue) * 100
      : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Snapshot — Period {snapshot.periodNumber}
            </h1>
            <Badge className="bg-gray-100 text-gray-600">CLOSED</Badge>
          </div>
          <p className="text-sm text-gray-500">
            Snapshot recorded: {formatDate(snapshot.snapshotAt)}
            {snapshot.notes && (
              <span className="ml-2 text-gray-400 italic">"{snapshot.notes}"</span>
            )}
          </p>
          {snapshot.metrics && (
            <p className="text-xs text-gray-400">
              Margin: {formatCurrency(snapshot.metrics.marginForecast)} ({marginPct.toFixed(1)}%)
            </p>
          )}
        </div>

        <Button variant="outline" onClick={handleExport}>
          <Download className="size-4" />
          Export CSV Bundle
        </Button>
      </div>

      <Tabs defaultValue="metrics">
        <TabsList>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="scope">Scope</TabsTrigger>
          <TabsTrigger value="work-table">Work Table</TabsTrigger>
          <TabsTrigger value="actuals">Actuals</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics">
          {snapshot.metrics ? (
            <MetricsTab metrics={snapshot.metrics} />
          ) : (
            <div className="pt-4 text-sm text-gray-400">No metrics available for this snapshot.</div>
          )}
        </TabsContent>

        <TabsContent value="scope">
          <ScopeTab
            rows={snapshot.scopeLines}
            getTaskName={getTaskName}
            getProfileName={getProfileName}
          />
        </TabsContent>

        <TabsContent value="work-table">
          <WorkTableTab
            snapshot={snapshot}
            getTaskName={getTaskName}
            getProfileName={getProfileName}
            getEmployeeName={getEmployeeName}
          />
        </TabsContent>

        <TabsContent value="actuals">
          <ActualsTab
            snapshot={snapshot}
            allTimesheets={allTimesheets}
            getTaskName={getTaskName}
            getProfileName={getProfileName}
            getEmployeeName={(id) => getEmployeeName(id)}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
