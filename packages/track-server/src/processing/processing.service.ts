import { Injectable } from '@nestjs/common'
import { BusinessService } from '../business/business.service'
import { EventDto } from '../common/dto/event'
import { StorageService } from '../storage/storage.service'

@Injectable()
export class ProcessingService {
  constructor(
    private readonly businessService: BusinessService,
    private readonly storageService: StorageService
  ) {}

  async processEvent(event: EventDto): Promise<void> {
    //  根据事件类型调用相应业务逻辑
    switch (event.type) {
      case 'error':
        await this.businessService.reportErrorEvent(event)
        break
      case 'performance':
        break
      case 'userBehavior':
        break
      default:
        console.warn(`Unknown event type: ${event.type}`)
    }
  }
  // 简单查询 不走业务层
  async getEvents(type: string, time: string, limit: number): Promise<any[]> {
    return await this.storageService.getEvents({ type, time: Number(time), limit })
  }
}
