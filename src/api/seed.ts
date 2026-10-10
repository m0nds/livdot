import type { Event } from '../domain'

export const seedEvents: Event[] = [
  {
    id: 'evt_lagos_fight_night',
    title: 'Friday Night Fights: Lagos Edition',
    state: 'draft',
    scheduledAt: null,
    requirements: [
      { id: 'crew', label: 'Production crew assigned', satisfied: false },
      { id: 'ingest', label: 'Streaming ingest configured', satisfied: false },
      { id: 'pricing', label: 'Ticket pricing configured', satisfied: false },
    ],
  },
]

export const primaryEventId = seedEvents[0].id
