import type { EventState } from '../domain'

const STATE_LABEL: Record<EventState, string> = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  ready: 'Ready for Streaming',
  live: 'Live',
  completed: 'Completed',
  replay: 'Replay Available',
}

interface EventStateBadgeProps {
  state: EventState
}

export function EventStateBadge({ state }: EventStateBadgeProps) {
  return (
    <span className="rounded-full border border-neutral-300 px-3 py-1 text-sm text-neutral-700">
      {STATE_LABEL[state]}
    </span>
  )
}
