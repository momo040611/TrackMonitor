import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { EventDto } from 'src/common/dto/event'
import { EventEntity } from './entities/event.entity'

@Injectable()
export class DatabaseService {
  constructor(
    @InjectRepository(EventEntity) // 添加这个装饰器
    private readonly eventRepository: Repository<EventEntity>
  ) {}

  async saveEvent(event: EventDto): Promise<number> {
    const eventEntity = new EventEntity()
    Object.assign(eventEntity, event)
    await this.eventRepository.save(eventEntity)
    return eventEntity.id
  }

  async getEvents(params: { type?: string; time?: number; limit?: number }): Promise<any[]> {
    // 获取事件逻辑
    return this.eventRepository.find({
      where: {
        type: params.type,
      },
      order: {
        timestamp: 'DESC',
      },
      take: params.limit,
    })
  }
}
