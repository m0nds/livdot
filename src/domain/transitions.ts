import type { Event, EventState } from './event'
import { missingRequirements } from './readiness'

export type TransitionBlocker =
  | { reason: 'missing-schedule' }
  | { reason: 'missing-requirement'; requirementId: string; label: string }
  | { reason: 'invalid-transition'; from: EventState; to: EventState }

export interface TransitionCheck {
  allowed: boolean
  blockers: TransitionBlocker[]
}

const FORWARD_TRANSITIONS: Record<EventState, EventState[]> = {
  draft: ['scheduled'],
  scheduled: ['ready'],
  ready: ['live'],
  live: ['completed'],
  completed: ['replay'],
  replay: [],
}

export function nextState(current: EventState): EventState | null {
  return FORWARD_TRANSITIONS[current][0] ?? null
}

export function checkTransition(event: Event, to: EventState): TransitionCheck {
  if (!FORWARD_TRANSITIONS[event.state].includes(to)) {
    return {
      allowed: false,
      blockers: [{ reason: 'invalid-transition', from: event.state, to }],
    }
  }

  const blockers: TransitionBlocker[] = []

  if (to === 'scheduled' && !event.scheduledAt) {
    blockers.push({ reason: 'missing-schedule' })
  }

  if (to === 'ready') {
    for (const requirement of missingRequirements(event.requirements)) {
      blockers.push({
        reason: 'missing-requirement',
        requirementId: requirement.id,
        label: requirement.label,
      })
    }
  }

  return { allowed: blockers.length === 0, blockers }
}

export function checkAdvance(event: Event): TransitionCheck {
  const target = nextState(event.state)
  if (!target) {
    return {
      allowed: false,
      blockers: [{ reason: 'invalid-transition', from: event.state, to: event.state }],
    }
  }
  return checkTransition(event, target)
}
