import type { ReactNode } from 'react'

interface HintTextProps {
  children: ReactNode
}

/** Italic muted hint — text-xs italic text-gray-400 */
export function HintText({ children }: HintTextProps) {
  return <span className="text-xs italic text-gray-400">{children}</span>
}
