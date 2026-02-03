import { Injectable, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, MoreThanOrEqual, IsNull, Not } from 'typeorm'
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
    eventEntity.url = event.url || '' // 这里已经处理了url，和之前报错的问题解耦
    eventEntity.priority = priorityMap[event.priority] || 0
    eventEntity.userId = event.userId || 0
    // 手动赋值timestamp（防止实体未配置默认值导致查询时间匹配不上）
    eventEntity.timestamp = new Date()
    const savedEntity = await this.eventRepository.save(eventEntity)
    return savedEntity.id
  }

  async getEvents(params: {
    type?: string
    time?: number
    limit?: number
  }): Promise<EventEntity[]> {
    const { type, time, limit } = params
    // 构建查询条件（仅保留有值的条件，避免undefined导致的查询异常）
    const whereCondition: Record<string, any> = {}

    // 处理type条件：非all/非空时才添加
    if (type && type !== 'all') {
      whereCondition.type = type
    }

    // 处理time条件：时间参数有效时，添加时间筛选
    if (time) {
      const timeMs = ms(time)
      if (!timeMs) {
        throw new BadRequestException('时间参数格式错误，支持如 1h/1d/30m 等格式')
      }
      const startTime = new Date(Date.now() - timeMs)
      whereCondition.timestamp = MoreThanOrEqual(startTime)
    }

    // 执行查询：仅传递有值的条件、排序、分页
    return this.eventRepository.find({
      where: whereCondition,
      order: { timestamp: 'DESC' },
      take: limit ? Number(limit) : undefined, // 确保limit是数字
      select: ['id', 'type', 'url', 'data', 'userId', 'timestamp', 'priority'], // 可选：指定返回字段，避免冗余
    })
  }
}
