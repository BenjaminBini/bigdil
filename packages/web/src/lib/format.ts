export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDays(days: number): string {
  if (days === 0) return '—'
  return days % 1 === 0 ? days.toString() : days.toFixed(2).replace(/0$/, '')
}

export function formatDaysWithUnit(days: number): string {
  if (days === 0) return '—'
  return `${formatDays(days)}d`
}

export function formatDate(date: string | null): string {
  if (!date) return '—'
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date))
}

export function formatShortDate(date: string): string {
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short' }).format(new Date(date))
}
