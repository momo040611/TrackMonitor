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
        await this.businessService.reportUserBehaviorEvent(event)
        break
      default:
        console.warn(`Unknown event type: ${event.type}`)
    }
  }

  // 修复：移除 Number(time)，直接传递 string 类型的 time（适配 ms 库）
  async getEvents(type: string, time: string, limit: number): Promise<any[]> {
    // 关键修改：time 不再转数字，直接传原始字符串
    return await this.storageService.getEvents({ type, time, limit })
  }

  // 获取所有事件
  async getEventList(type: string): Promise<any[]> {
    return await this.storageService.getEvents({ type })
  }
}
