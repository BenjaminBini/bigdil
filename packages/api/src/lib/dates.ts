// Tiny helpers to bridge between Prisma `DateTime` (Date) and the period-utils
// API (ISO-8601 calendar strings, "YYYY-MM-DD"). Centralising the conversion
// keeps it consistent and easy to audit.

export function toIsoDate(d: Date | string | null | undefined): string {
  if (!d) return ''
  if (d instanceof Date) return d.toISOString().slice(0, 10)
  // already a string — assume ISO format
  return d.slice(0, 10)
}

export function toIsoDateOrNull(d: Date | string | null | undefined): string | null {
  if (!d) return null
  return toIsoDate(d)
}

export function fromIsoDate(s: string): Date {
  // Treat as UTC midnight to avoid timezone drift on date-only fields.
  return new Date(`${s}T00:00:00Z`)
}
