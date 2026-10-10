export type ScheduleBlockReason = 'in-past' | 'invalid-date'

export interface ScheduleCheck {
  allowed: boolean
  reason?: ScheduleBlockReason
}

export function checkSchedule(scheduledAt: string, now: Date = new Date()): ScheduleCheck {
  const target = new Date(scheduledAt)

  if (Number.isNaN(target.getTime())) {
    return { allowed: false, reason: 'invalid-date' }
  }

  if (target.getTime() <= now.getTime()) {
    return { allowed: false, reason: 'in-past' }
  }

  return { allowed: true }
}
