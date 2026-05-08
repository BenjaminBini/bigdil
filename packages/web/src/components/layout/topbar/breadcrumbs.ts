const ROUTE_LABELS: Record<string, string> = {
  projects: 'Projects',
  clients: 'Clients',
  profiles: 'Profiles',
  employees: 'Employees',
  timesheets: 'Timesheets',
  approvals: 'Approvals',
  users: 'Users',
  settings: 'Settings',
  'work-table': 'Work Table',
  'quote-detail': 'Quote',
  'planning-detail': 'Planning',
}

export interface Breadcrumb {
  label: string
  href: string
}

export function buildBreadcrumbs(pathname: string): Breadcrumb[] {
  const segments = pathname.split('/').filter(Boolean)
  const crumbs: Breadcrumb[] = [{ label: 'Home', href: '/' }]
  let path = ''
  for (const segment of segments) {
    path += `/${segment}`
    const label = ROUTE_LABELS[segment] ?? (segment.charAt(0).toUpperCase() + segment.slice(1))
    crumbs.push({ label, href: path })
  }
  return crumbs
}
