import { useCallback, useEffect, useState } from 'react'
import * as api from '../api'
import { checkAdvance, type Event, type RequirementId, type TransitionCheck } from '../domain'

interface UseEventResult {
  event: Event | null
  isLoading: boolean
  loadError: string | null
  advanceCheck: TransitionCheck | null
  isAdvancing: boolean
  advance: () => Promise<void>
  pendingRequirements: Set<RequirementId>
  toggleRequirement: (id: RequirementId, satisfied: boolean) => Promise<void>
  isScheduling: boolean
  schedule: (scheduledAt: string) => Promise<void>
  actionError: string | null
}

export function useEvent(eventId: string): UseEventResult {
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isAdvancing, setIsAdvancing] = useState(false)
  const [pendingRequirements, setPendingRequirements] = useState<Set<RequirementId>>(
    new Set(),
  )
  const [isScheduling, setIsScheduling] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setLoadError(null)

    api
      .fetchEvent(eventId)
      .then((fetched) => {
        if (!cancelled) setEvent(fetched)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'failed to load event')
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [eventId])

  const advance = useCallback(async () => {
    setIsAdvancing(true)
    setActionError(null)
    try {
      setEvent(await api.advanceState(eventId))
    } catch (err) {
      setActionError(
        err instanceof api.TransitionBlockedError
          ? 'event is missing requirements to advance'
          : err instanceof Error
            ? err.message
            : 'failed to advance event',
      )
    } finally {
      setIsAdvancing(false)
    }
  }, [eventId])

  const toggleRequirement = useCallback(
    async (requirementId: RequirementId, satisfied: boolean) => {
      setPendingRequirements((prev) => new Set(prev).add(requirementId))
      setActionError(null)
      try {
        setEvent(await api.setRequirement(eventId, requirementId, satisfied))
      } catch (err) {
        setActionError(err instanceof Error ? err.message : 'failed to update requirement')
      } finally {
        setPendingRequirements((prev) => {
          const next = new Set(prev)
          next.delete(requirementId)
          return next
        })
      }
    },
    [eventId],
  )

  const schedule = useCallback(
    async (scheduledAt: string) => {
      setIsScheduling(true)
      setActionError(null)
      try {
        setEvent(await api.setSchedule(eventId, scheduledAt))
      } catch (err) {
        setActionError(err instanceof Error ? err.message : 'failed to schedule event')
      } finally {
        setIsScheduling(false)
      }
    },
    [eventId],
  )

  return {
    event,
    isLoading,
    loadError,
    advanceCheck: event ? checkAdvance(event) : null,
    isAdvancing,
    advance,
    pendingRequirements,
    toggleRequirement,
    isScheduling,
    schedule,
    actionError,
  }
}
