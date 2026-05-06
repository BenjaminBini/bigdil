import type { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { NumberedList } from '@/components/shared/numbered-list'

function BodyText({ children }: { children: ReactNode }) {
  return <p className="text-sm leading-relaxed text-gray-700">{children}</p>
}

const nextSteps = [
  'Set start and end dates for the project',
  'Review and confirm the period grid',
  'Assign planned days to each period in the Work Table',
  'Start the project when planning is complete',
]

export function ProjectNextStepsCard() {
  return (
    <Card variant="compact">
      <CardHeader>
        <CardTitle>Next Steps</CardTitle>
      </CardHeader>
      <CardContent>
        <BodyText>
          Set start and end dates to generate the period grid, then distribute quoted days across
          periods.
        </BodyText>
        <NumberedList items={nextSteps} />
      </CardContent>
    </Card>
  )
}
