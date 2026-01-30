export enum EventPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export class EventDto {
  id: number
  type: string
  data: JSON
  userId: string
  timestamp: number
  priority: EventPriority
}
