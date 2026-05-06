import type { ReactNode } from 'react'

const sizes = { sm: 'w-40', md: 'w-44', default: 'w-56' } as const

interface FilterWrapperProps {
  children: ReactNode
  /** sm=w-40, md=w-44, default=w-56 */
  size?: keyof typeof sizes
}

/** Fixed-width wrapper for filter Select controls */
export function FilterWrapper({ children, size = 'default' }: FilterWrapperProps) {
  return <div className={sizes[size]}>{children}</div>
}
