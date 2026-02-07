import { Injectable, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, MoreThanOrEqual } from 'typeorm'
import { EventDto } from 'src/common/dto/event'
import { EventEntity } from './entities/event.entity'
import { EventPriority } from 'src/common/dto/event'
import ms from 'ms'

const priorityMap: Record<EventPriority, number> = {
  [EventPriority.LOW]: 0,
  [EventPriority.MEDIUM]: 1,
  [EventPriority.HIGH]: 2,
}

@Injectable()
export class DatabaseService {
  constructor(
    @InjectRepository(EventEntity)
    private readonly eventRepository: Repository<EventEntity>
  ) {}

  async saveEvent(event: EventDto): Promise<number> {
    const eventEntity = new EventEntity()
    eventEntity.type = event.type
    eventEntity.data = event.data
    eventEntity.url = event.url || ''
    eventEntity.priority = priorityMap[event.priority] || 0
    eventEntity.userId = event.userId || 0 // 兜底0，避免undefined
    eventEntity.sessionId = event.sessionId || ''
    eventEntity.timestamp = new Date()
    const savedEntity = await this.eventRepository.save(eventEntity)
    return savedEntity.id
  }

  async getEvents(params: {
    type?: string
    time?: string
    limit?: number
    userId?: number
  }): Promise<EventEntity[]> {
    const { type, time, limit, userId } = params
    const whereCondition: Record<string, any> = {}

    if (type && type !== 'all') {
      whereCondition.type = type
    }

    if (userId && userId !== 0) {
      whereCondition.userId = userId
    }

    if (time) {
      try {
        // 修复1：先执行 ms 解析，再强制类型断言为 number + 兜底
        const parsedTime = ms(time as any)
        // 确保 parsedTime 是有效数字（排除 string/undefined 情况）
        const timeMs = typeof parsedTime === 'number' ? parsedTime : NaN

        // 修复2：严格校验 timeMs 是有效数字，避免算术运算报错
        if (isNaN(timeMs) || timeMs <= 0) {
          throw new Error('Invalid time format')
        }

        // 此时 timeMs 100% 是有效数字，算术运算无类型报错
        const startTime = new Date(Date.now() - timeMs)
        whereCondition.timestamp = MoreThanOrEqual(startTime)
      } catch (error) {
        throw new BadRequestException('时间参数格式错误，支持如 1h/1d/30m 等格式')
      }
    }

    return this.eventRepository.find({
      where: whereCondition,
      order: { timestamp: 'DESC' },
      take: limit ? Number(limit) : undefined,
      select: ['id', 'type', 'url', 'data', 'userId', 'timestamp', 'priority'],
    })
  }
}
