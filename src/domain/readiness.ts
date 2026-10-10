import type { EventState } from './event'

export type RequirementId = 'crew' | 'ingest' | 'pricing'

export interface ReadinessRequirement {
  id: RequirementId
  label: string
  satisfied: boolean
}

const EDITABLE_STATES: EventState[] = ['draft', 'scheduled']

export function isReadinessEditable(state: EventState): boolean {
  return EDITABLE_STATES.includes(state)
}

export function missingRequirements(
  requirements: ReadinessRequirement[],
): ReadinessRequirement[] {
  return requirements.filter((requirement) => !requirement.satisfied)
}

export function isFullySatisfied(requirements: ReadinessRequirement[]): boolean {
  return missingRequirements(requirements).length === 0
}
