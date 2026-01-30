import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { EventDto } from 'src/dto/event'
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

  async getEvents(params: any): Promise<any[]> {
    // 获取事件逻辑
    return this.eventRepository.find(params)
  }
}
