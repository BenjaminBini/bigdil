import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const ALL_VALUE = 'all'

const statusOptions: { value: string; label: string }[] = [
  { value: ALL_VALUE, label: 'All statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
]

interface FiltersBarProps {
  periodFilter: string
  employeeFilter: string
  taskFilter: string
  statusFilter: string
  periodOptions: Array<{ value: string; label: string }>
  employeeOptions: Array<{ value: string; label: string }>
  taskOptions: Array<{ value: string; label: string }>
  setPeriodFilter: (value: string) => void
  setEmployeeFilter: (value: string) => void
  setTaskFilter: (value: string) => void
  setStatusFilter: (value: string) => void
}

export function FiltersBar({
  periodFilter,
  employeeFilter,
  taskFilter,
  statusFilter,
  periodOptions,
  employeeOptions,
  taskOptions,
  setPeriodFilter,
  setEmployeeFilter,
  setTaskFilter,
  setStatusFilter,
}: FiltersBarProps) {
  const hasFilters =
    periodFilter !== ALL_VALUE ||
    employeeFilter !== ALL_VALUE ||
    taskFilter !== ALL_VALUE ||
    statusFilter !== ALL_VALUE

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={periodFilter} onValueChange={setPeriodFilter}>
        <SelectTrigger className="w-56">
          <SelectValue placeholder="All periods" />
        </SelectTrigger>
        <SelectContent>
          {periodOptions.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="All employees" />
        </SelectTrigger>
        <SelectContent>
          {employeeOptions.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={taskFilter} onValueChange={setTaskFilter}>
        <SelectTrigger className="w-56">
          <SelectValue placeholder="All tasks" />
        </SelectTrigger>
        <SelectContent>
          {taskOptions.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <button
          type="button"
          onClick={() => {
            setPeriodFilter(ALL_VALUE)
            setEmployeeFilter(ALL_VALUE)
            setTaskFilter(ALL_VALUE)
            setStatusFilter(ALL_VALUE)
          }}
          className="text-xs text-gray-500 underline hover:text-gray-700 transition-colors"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
