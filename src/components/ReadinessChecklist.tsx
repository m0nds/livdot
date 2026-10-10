import type { ReadinessRequirement, RequirementId } from '../domain'

interface ReadinessChecklistProps {
  requirements: ReadinessRequirement[]
  pendingRequirements: Set<RequirementId>
  onToggle: (id: RequirementId, satisfied: boolean) => void
}

export function ReadinessChecklist({
  requirements,
  pendingRequirements,
  onToggle,
}: ReadinessChecklistProps) {
  return (
    <ul className="flex flex-col gap-2">
      {requirements.map((requirement) => {
        const isPending = pendingRequirements.has(requirement.id)
        return (
          <li key={requirement.id} className="flex items-center gap-3">
            <input
              type="checkbox"
              id={`requirement-${requirement.id}`}
              checked={requirement.satisfied}
              disabled={isPending}
              onChange={(event) => onToggle(requirement.id, event.target.checked)}
            />
            <label
              htmlFor={`requirement-${requirement.id}`}
              className={requirement.satisfied ? 'text-neutral-900' : 'text-neutral-500'}
            >
              {requirement.label}
            </label>
            {isPending && <span className="text-xs text-neutral-400">updating…</span>}
          </li>
        )
      })}
    </ul>
  )
}
