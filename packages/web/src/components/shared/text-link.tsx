import type { ReactNode } from 'react'

interface TextLinkProps {
  onClick?: () => void
  children: ReactNode
}

export function TextLink({ onClick, children }: TextLinkProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-blue-600 hover:underline"
    >
      {children}
    </button>
  )
}
