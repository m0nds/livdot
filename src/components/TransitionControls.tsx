import { useState } from 'react'
import { nextState } from '../domain'
import type { Event, EventState, TransitionCheck } from '../domain'

const TARGET_LABEL: Record<EventState, string> = {
  draft: 'Draft',
  scheduled: 'Schedule Event',
  ready: 'Mark Ready for Streaming',
  live: 'Go Live',
  completed: 'End Event',
  replay: 'Enable Replay',
}

function describeBlocker(blocker: TransitionCheck['blockers'][number]): string {
  switch (blocker.reason) {
    case 'missing-schedule':
      return 'Set a schedule date to continue'
    case 'missing-requirement':
      return `${blocker.label} is not configured yet`
    case 'invalid-transition':
      return 'No further actions available for this event'
  }
}

interface TransitionControlsProps {
  event: Event
  advanceCheck: TransitionCheck | null
  isAdvancing: boolean
  onAdvance: () => void
  isScheduling: boolean
  onSchedule: (scheduledAt: string) => void
}

export function TransitionControls({
  event,
  advanceCheck,
  isAdvancing,
  onAdvance,
  isScheduling,
  onSchedule,
}: TransitionControlsProps) {
  const [scheduleInput, setScheduleInput] = useState('')
  const target = nextState(event.state)

  if (!target) {
    return (
      <p className="text-sm text-neutral-500">
        This event has reached the end of its lifecycle.
      </p>
    )
  }

  const blockers = advanceCheck?.blockers ?? []
  const canAdvance = advanceCheck?.allowed ?? false

  return (
    <div className="flex flex-col gap-3">
      {event.state === 'draft' && (
        <div className="flex items-center gap-2">
          <input
            type="datetime-local"
            value={scheduleInput}
            onChange={(e) => setScheduleInput(e.target.value)}
            className="border border-neutral-300 px-2 py-1 text-sm"
          />
          <button
            type="button"
            disabled={!scheduleInput || isScheduling}
            onClick={() => onSchedule(new Date(scheduleInput).toISOString())}
            className="border border-neutral-300 px-3 py-1 text-sm disabled:opacity-40"
          >
            {isScheduling ? 'Setting…' : 'Set schedule'}
          </button>
        </div>
      )}

      {event.scheduledAt && (
        <p className="text-xs text-neutral-500">
          Scheduled for {new Date(event.scheduledAt).toLocaleString()}
        </p>
      )}

      <div>
        <button
          type="button"
          disabled={!canAdvance || isAdvancing}
          onClick={onAdvance}
          className="border border-neutral-900 bg-neutral-900 px-4 py-2 text-sm text-white disabled:border-neutral-300 disabled:bg-neutral-100 disabled:text-neutral-400"
        >
          {isAdvancing ? 'Working…' : TARGET_LABEL[target]}
        </button>

        {!canAdvance && blockers.length > 0 && (
          <ul className="mt-2 flex flex-col gap-1 text-xs text-red-600">
            {blockers.map((blocker, index) => (
              <li key={index}>{describeBlocker(blocker)}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
