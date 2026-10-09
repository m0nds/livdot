import type { ReadinessRequirement } from './readiness'

export type EventState =
  | 'draft'
  | 'scheduled'
  | 'ready'
  | 'live'
  | 'completed'
  | 'replay'

export interface Event {
  id: string
  title: string
  state: EventState
  scheduledAt: string | null
  requirements: ReadinessRequirement[]
}
