import type { Event, RequirementId } from '../domain'
import {
  checkSchedule,
  checkTransition,
  isReadinessEditable,
  nextState,
  type ScheduleBlockReason,
  type TransitionBlocker,
} from '../domain'
import { seedEvents } from './seed'

const LATENCY_MS = 650

export class TransitionBlockedError extends Error {
  blockers: TransitionBlocker[]

  constructor(blockers: TransitionBlocker[]) {
    super('transition blocked')
    this.blockers = blockers
  }
}

export class ScheduleInvalidError extends Error {
  reason: ScheduleBlockReason

  constructor(reason: ScheduleBlockReason) {
    super('invalid schedule date')
    this.reason = reason
  }
}

export class RequirementLockedError extends Error {
  constructor() {
    super('requirement is locked')
  }
}

let events: Event[] = structuredClone(seedEvents)

function delay<T>(value: T, ms = LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

function findEvent(id: string): Event {
  const event = events.find((candidate) => candidate.id === id)
  if (!event) throw new Error(`event not found: ${id}`)
  return event
}

export async function fetchEvents(): Promise<Event[]> {
  return delay(structuredClone(events))
}

export async function fetchEvent(id: string): Promise<Event> {
  return delay(structuredClone(findEvent(id)))
}

export async function setSchedule(id: string, scheduledAt: string): Promise<Event> {
  const event = findEvent(id)

  const check = checkSchedule(scheduledAt)
  if (!check.allowed) throw new ScheduleInvalidError(check.reason!)

  event.scheduledAt = scheduledAt
  return delay(structuredClone(event))
}

export async function setRequirement(
  id: string,
  requirementId: RequirementId,
  satisfied: boolean,
): Promise<Event> {
  const event = findEvent(id)
  if (!isReadinessEditable(event.state)) throw new RequirementLockedError()

  event.requirements = event.requirements.map((requirement) =>
    requirement.id === requirementId ? { ...requirement, satisfied } : requirement,
  )
  return delay(structuredClone(event))
}

export async function advanceState(id: string): Promise<Event> {
  const event = findEvent(id)
  const target = nextState(event.state)
  if (!target) {
    throw new TransitionBlockedError([
      { reason: 'invalid-transition', from: event.state, to: event.state },
    ])
  }

  const check = checkTransition(event, target)
  if (!check.allowed) throw new TransitionBlockedError(check.blockers)

  event.state = target
  return delay(structuredClone(event))
}
