import { UserCog, X } from 'lucide-react'
import { toast } from 'sonner'
import { useCurrentUser, useStopImpersonating } from '@/api/hooks'
import { Button } from '@/components/ui/button'

export function ImpersonationBanner() {
  const { data: session } = useCurrentUser()
  const stop = useStopImpersonating()

  if (!session?.isImpersonating) return null

  function handleStop() {
    stop.mutate(undefined, {
      onSuccess: () => toast.success('Stopped impersonating'),
      onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed to stop impersonating'),
    })
  }

  return (
    <div className="flex items-center justify-between gap-3 border-b border-amber-500/40 bg-amber-500/15 px-4 py-2 text-sm text-amber-100">
      <div className="flex items-center gap-2">
        <UserCog className="size-4 shrink-0" />
        <span>
          Acting as <strong>{session.user.name}</strong> ({session.user.role}) —
          signed in as {session.realUser.name}
        </span>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={handleStop}
        disabled={stop.isPending}
        className="h-7 gap-1 border-amber-400/60 bg-transparent text-amber-100 hover:bg-amber-500/20 hover:text-amber-50"
      >
        <X className="size-3.5" />
        Stop
      </Button>
    </div>
  )
}
