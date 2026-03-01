const ROUTE_LABELS: Record<string, string> = {
  projects: 'Projects',
  clients: 'Clients',
  profiles: 'Profiles',
  employees: 'Employees',
  timesheets: 'Timesheets',
  approvals: 'Approvals',
  users: 'Users',
  settings: 'Settings',
}

export function buildBreadcrumbs(pathname: string): string[] {
  const segments = pathname.split('/').filter(Boolean)
  const crumbs: string[] = ['Home']
  for (const segment of segments) {
    const label = ROUTE_LABELS[segment]
    if (label) {
      crumbs.push(label)
    } else {
      crumbs.push(segment.charAt(0).toUpperCase() + segment.slice(1))
    }
  }
  return crumbs
}
