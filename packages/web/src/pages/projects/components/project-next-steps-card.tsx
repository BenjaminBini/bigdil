import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
        <ol className="space-y-3">
          {nextSteps.map((step, index) => (
            <li key={step} className="flex items-start gap-3">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-gray-300 text-xs font-bold text-gray-400">
                {index + 1}
              </span>
              <span className="text-sm text-gray-600">{step}</span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}
