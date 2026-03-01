import { Lock } from 'lucide-react'

interface WorkTableHeaderProps {
  projectName: string
  periodCount: number
}

export function WorkTableHeader({ projectName, periodCount }: WorkTableHeaderProps) {
  return (
    <div className="flex shrink-0 items-center justify-between border-b bg-white px-4 py-3">
      <div>
        <h1 className="text-base font-semibold text-slate-900">Work Table</h1>
        <p className="mt-0.5 text-xs text-slate-500">
          {projectName} - {periodCount} periods
        </p>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <span className="inline-flex size-3 items-center justify-center rounded-sm border border-slate-200 bg-slate-100">
            <Lock className="size-2 text-slate-400" />
          </span>
          Frozen
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block size-3 rounded-sm border border-amber-200 bg-amber-100" />
          Consolidation
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block size-3 rounded-sm border border-sky-200 bg-sky-100" />
          Open
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block size-3 rounded-sm border border-slate-200 bg-white" />
          Future
        </span>
      </div>
    </div>
  )
}
