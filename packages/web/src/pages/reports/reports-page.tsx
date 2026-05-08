import { PageHeader } from '@/components/shared/page-header'
import { PageContainer } from '@/components/shared/page-container'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FinancialTab } from './components/financial-tab'
import { UtilizationTab } from './components/utilization-tab'

export default function ReportsPage() {
  return (
    <>
      <PageHeader title="Rapports" subtitle="Analyse financière et taux d'occupation" />
      <PageContainer size="full">
      <Tabs defaultValue="financial">
        <TabsList>
          <TabsTrigger value="financial">Financier</TabsTrigger>
          <TabsTrigger value="utilization">Occupation</TabsTrigger>
        </TabsList>
        <TabsContent value="financial">
          <FinancialTab />
        </TabsContent>
        <TabsContent value="utilization">
          <UtilizationTab />
        </TabsContent>
      </Tabs>
      </PageContainer>
    </>
  )
}
