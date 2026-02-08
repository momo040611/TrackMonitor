import { Injectable, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, MoreThanOrEqual, Between, IsNull, Not } from 'typeorm'
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
    time?: string // 相对时间：1h, 1d, 7d 等
    startTime?: string // 绝对时间区间-开始：ISO 8601 格式
    endTime?: string // 绝对时间区间-结束：ISO 8601 格式
    limit?: number
    userId?: number
  }): Promise<EventEntity[]> {
    const { type, time, startTime, endTime, limit, userId } = params

    const hasRelativeTime = !!time
    const hasAbsoluteTime = !!(startTime || endTime)

    if (hasRelativeTime && hasAbsoluteTime) {
      throw new BadRequestException(
        '参数冲突：time（相对时间，如1h/7d）与 startTime/endTime（绝对时间区间）不能同时使用'
      )
    }

    const whereCondition: Record<string, any> = {}

    // 处理type条件
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
          throw new BadRequestException('时间参数格式错误，支持如 1h/1d/30m 等格式')
        }

        const MAX_TIME_RANGE = ms('90d')
        if (timeMs > MAX_TIME_RANGE) {
          throw new BadRequestException('查询时间范围过大，最大支持 90d')
        }

        // 此时 timeMs 100% 是有效数字，算术运算无类型报错
        const startTimePoint = new Date(Date.now() - timeMs)
        whereCondition.timestamp = MoreThanOrEqual(startTimePoint)
      } catch (error) {
        if (error instanceof BadRequestException) {
          throw error
        }
        throw new BadRequestException('时间参数格式错误，支持如 1h/1d/30m 等格式')
      }
    }

    if (startTime || endTime) {
      const start = startTime ? new Date(startTime) : new Date(0) // 默认从1970开始
      const end = endTime ? new Date(endTime) : new Date() // 默认到现在

      // 校验日期有效性
      if (startTime && isNaN(start.getTime())) {
        throw new BadRequestException(
          'startTime 格式错误，请使用 ISO 8601 格式，如 2023-10-23T00:00:00Z'
        )
      }
      if (endTime && isNaN(end.getTime())) {
        throw new BadRequestException(
          'endTime 格式错误，请使用 ISO 8601 格式，如 2023-10-23T23:59:59Z'
        )
      }

      // 校验时间顺序
      if (start >= end) {
        throw new BadRequestException('startTime 必须早于 endTime')
      }

      whereCondition.timestamp = Between(start, end)
    }

    // 执行查询
    return this.eventRepository.find({
      where: whereCondition,
      order: { timestamp: 'DESC' },
      take: limit ? Number(limit) : undefined,
      select: ['id', 'type', 'url', 'data', 'userId', 'timestamp', 'priority'],
    })
  }
}
