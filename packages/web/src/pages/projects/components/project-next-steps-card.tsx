import type { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { NumberedList } from '@/components/shared/numbered-list'

function BodyText({ children }: { children: ReactNode }) {
  return <p className="text-sm leading-relaxed text-foreground/80">{children}</p>
}

const nextSteps = [
  'Créer et valider un devis (onglet Devis) avec les profils et jours vendus',
  'Définir les dates de début et de fin du projet',
  'Cliquer « Activer le projet » pour passer le projet en mode actif',
  'Cliquer « Planifier » pour générer les périodes et accéder au tableau de planification',
  'Assigner les collaborateurs et répartir les jours par période',
  'Cliquer « Démarrer le projet » pour ouvrir la première semaine',
]

export function ProjectNextStepsCard() {
  return (
    <Card variant="compact">
      <CardHeader>
        <CardTitle>Prochaines étapes</CardTitle>
      </CardHeader>
      <CardContent>
        <BodyText>
          Un devis validé est requis avant de pouvoir planifier. Les phases et tâches se créent directement dans le tableau de planification.
        </BodyText>
        <NumberedList items={nextSteps} />
      </CardContent>
    </Card>
  )
}
