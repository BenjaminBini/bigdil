import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface IconBoxProps {
  icon: LucideIcon
  size?: 'sm' | 'md' | 'lg'
  variant?: 'muted' | 'primary' | 'accent'
  className?: string
}

const SIZE_CLASSES = {
  sm: { box: 'size-8 rounded-lg', icon: 'size-4' },
  md: { box: 'size-11 rounded-xl', icon: 'size-5' },
  lg: { box: 'size-14 rounded-2xl', icon: 'size-6' },
}

const VARIANT_CLASSES = {
  muted: 'bg-muted text-muted-foreground',
  primary: 'bg-primary text-primary-foreground shadow-sm',
  accent: 'bg-blue-100 text-blue-600',
}

export function IconBox({ icon: Icon, size = 'md', variant = 'muted', className }: IconBoxProps) {
  const s = SIZE_CLASSES[size]
  return (
    <div className={cn('flex items-center justify-center', s.box, VARIANT_CLASSES[variant], className)}>
      <Icon className={s.icon} />
    </div>
  )
}
