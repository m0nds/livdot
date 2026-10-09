export type RequirementId = 'crew' | 'ingest' | 'pricing'

export interface ReadinessRequirement {
  id: RequirementId
  label: string
  satisfied: boolean
}

export function missingRequirements(
  requirements: ReadinessRequirement[],
): ReadinessRequirement[] {
  return requirements.filter((requirement) => !requirement.satisfied)
}

export function isFullySatisfied(requirements: ReadinessRequirement[]): boolean {
  return missingRequirements(requirements).length === 0
}
