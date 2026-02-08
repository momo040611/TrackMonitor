import { Injectable } from '@nestjs/common'
import { BusinessService } from '../business/business.service'
import { EventDto } from '../common/dto/event'
import { StorageService } from '../storage/storage.service'
import { AnalyzeWokerService } from '../business/ai/wokers/analyzeWoker.service'

@Injectable()
export class ProcessingService {
  constructor(
    private readonly businessService: BusinessService,
    private readonly storageService: StorageService,
    private readonly analyzeWokerService: AnalyzeWokerService
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
  // 简单查询 不走业务层
  async getEvents(
    type: string,
    time: string,
    startTime?: string,
    endTime?: string,
    limit?: number
  ): Promise<any[]> {
    return await this.storageService.getEvents({
      type,
      time: Number(time),
      startTime,
      endTime,
      limit,
    })
  }

  // 获取所有事件
  async getEventList(type: string): Promise<any[]> {
    return await this.storageService.getEvents({ type })
  }

  // 分析事件
  async analyzeEvent(type: string, time: string, startTime?: string, endTime?: string) {
    return await this.analyzeWokerService.analyzeEvent({ type, time, startTime, endTime })
  }
}
