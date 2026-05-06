import { PageHeader } from '@/components/shared/page-header'
import { PageContainer } from '@/components/shared/page-container'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FinancialTab } from './components/financial-tab'
import { UtilizationTab } from './components/utilization-tab'

export default function ReportsPage() {
  return (
    <PageContainer size="full">
      <PageHeader title="Reports" subtitle="Financial and utilization analysis" />

      <Tabs defaultValue="financial">
        <TabsList>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="utilization">Utilization</TabsTrigger>
        </TabsList>
        <TabsContent value="financial">
          <FinancialTab />
        </TabsContent>
        <TabsContent value="utilization">
          <UtilizationTab />
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}
