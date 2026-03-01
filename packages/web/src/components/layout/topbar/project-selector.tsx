import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useProjects } from '@/api/hooks'

interface ProjectSelectorProps {
  projectId: string | null
  onProjectChange: (id: string) => void
}

export function ProjectSelector({ projectId, onProjectChange }: ProjectSelectorProps) {
  const { data: projects, isLoading } = useProjects()

  return (
    <Select value={projectId ?? ''} onValueChange={onProjectChange} disabled={isLoading}>
      <SelectTrigger size="sm" className="w-56">
        <SelectValue placeholder={isLoading ? 'Loading…' : 'Select a project…'} />
      </SelectTrigger>
      <SelectContent>
        {(projects ?? []).map((p) => (
          <SelectItem key={p.id} value={p.id}>
            {p.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
