import { PageHeader } from '@/components/shared/page-header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FinancialTab } from './components/financial-tab'
import { UtilizationTab } from './components/utilization-tab'

export default function ReportsPage() {
  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Reports" subtitle="Financial and utilization analysis" />

      <Tabs defaultValue="financial">
        <TabsList>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="utilization">Utilization</TabsTrigger>
        </TabsList>
        <TabsContent value="financial" className="mt-4">
          <FinancialTab />
        </TabsContent>
        <TabsContent value="utilization" className="mt-4">
          <UtilizationTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
