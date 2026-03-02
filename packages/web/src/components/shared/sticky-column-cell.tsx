import type { ComponentPropsWithoutRef, ElementType } from 'react'
import { cn } from '@/lib/utils'

type StickyColumnCellProps<T extends 'td' | 'th' = 'td'> = {
  as?: T
  width?: number
  zIndex?: number
  shadowColor?: string
} & ComponentPropsWithoutRef<T>

export function StickyColumnCell<T extends 'td' | 'th' = 'td'>({
  as,
  width = 260,
  zIndex = 20,
  shadowColor = '#cbd5e1',
  className,
  style,
  children,
  ...rest
}: StickyColumnCellProps<T>) {
  const Tag = (as ?? 'td') as ElementType

  return (
    <Tag
      className={cn(
        'sticky left-0 whitespace-nowrap px-3 py-1.5',
        className,
      )}
      style={{
        minWidth: width,
        width,
        zIndex,
        boxShadow: `2px 0 0 0 ${shadowColor}`,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  )
}
