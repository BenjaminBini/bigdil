import type { ComponentProps } from 'react'
import { Button } from '@/components/ui/button'

type ButtonProps = ComponentProps<typeof Button>

/** Green filled button for confirmations and approvals. */
export function SuccessButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="success" {...props} />
}

/** Amber filled button for proceeding-with-caution actions. */
export function WarningButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="warning" {...props} />
}

/** Red filled button for dangerous/irreversible actions. */
export function DangerButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="destructive" {...props} />
}

/** Small outlined green button — typically used inline in tables for approve actions. */
export function ApproveButton(props: Omit<ButtonProps, 'variant' | 'size'>) {
  return <Button variant="success-outline" size="sm" {...props} />
}

/** Small outlined red button — typically used inline in tables for reject actions. */
export function RejectButton(props: Omit<ButtonProps, 'variant' | 'size'>) {
  return <Button variant="destructive-outline" size="sm" {...props} />
}
