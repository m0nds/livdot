import { useEvent } from '../hooks/useEvent'
import { EventStateBadge } from './EventStateBadge'
import { ReadinessChecklist } from './ReadinessChecklist'
import { TransitionControls } from './TransitionControls'

interface EventDashboardProps {
  eventId: string
}

export function EventDashboard({ eventId }: EventDashboardProps) {
  const {
    event,
    isLoading,
    loadError,
    pendingRequirements,
    toggleRequirement,
    advanceCheck,
    isAdvancing,
    advance,
    isScheduling,
    schedule,
    actionError,
  } = useEvent(eventId)

  if (isLoading) {
    return <div className="p-6 text-sm text-neutral-500">Loading event…</div>
  }

  if (loadError || !event) {
    return <div className="p-6 text-sm text-red-600">{loadError ?? 'Event not found.'}</div>
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <header className="flex items-center justify-between border-b border-neutral-200 pb-4">
        <h1 className="text-xl font-semibold">{event.title}</h1>
        <EventStateBadge state={event.state} />
      </header>

      <main className="mt-6 grid gap-6">
        <section aria-label="readiness" className="rounded border border-neutral-200 p-4">
          <h2 className="mb-3 text-sm font-medium text-neutral-500">Readiness</h2>
          <ReadinessChecklist
            requirements={event.requirements}
            pendingRequirements={pendingRequirements}
            onToggle={(id, satisfied) => toggleRequirement(id, satisfied)}
          />
        </section>
        <section aria-label="actions" className="rounded border border-neutral-200 p-4">
          <h2 className="mb-3 text-sm font-medium text-neutral-500">Actions</h2>
          <TransitionControls
            event={event}
            advanceCheck={advanceCheck}
            isAdvancing={isAdvancing}
            onAdvance={() => advance()}
            isScheduling={isScheduling}
            onSchedule={(scheduledAt) => schedule(scheduledAt)}
          />
          {actionError && <p className="mt-3 text-xs text-red-600">{actionError}</p>}
        </section>
      </main>
    </div>
  )
}
