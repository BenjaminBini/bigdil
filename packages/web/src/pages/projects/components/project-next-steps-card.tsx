import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { NumberedList } from '@/components/shared/numbered-list'

const nextSteps = [
  'Set start and end dates for the project',
  'Review and confirm the period grid',
  'Assign planned days to each period in the Work Table',
  'Start the project when planning is complete',
]

export function ProjectNextStepsCard() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Next Steps</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <p className="text-sm leading-relaxed text-gray-700">
          Set start and end dates to generate the period grid, then distribute quoted days across
          periods.
        </p>
        <NumberedList items={nextSteps} />
      </CardContent>
    </Card>
  )
}
