import { Link, type LinkProps } from 'react-router'
import { cn } from '@/lib/utils'

interface AppLinkProps extends LinkProps {
  className?: string
  /** Add font-medium weight */
  bold?: boolean
}

/** Styled navigation link — blue text with hover underline */
export function AppLink({ className, bold, ...props }: AppLinkProps) {
  return <Link className={cn('text-blue-600 hover:underline', bold && 'font-medium', className)} {...props} />
}
