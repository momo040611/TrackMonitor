import { Injectable } from '@nestjs/common'
import { QueueService } from '../queue/queue.service'
import { ProcessingService } from '../processing/processing.service'
import { DatabaseService } from '../storage/database/database.service'
import { EventDto } from '../common/dto/event'

@Injectable()
export class GatewayService {
  constructor(
    private readonly queueService: QueueService,
    private readonly processingService: ProcessingService,
    private readonly databaseService: DatabaseService
  ) {}
  //单一队列
  async trackEvent(event: EventDto): Promise<{ success: boolean }> {
    // 验证、限流等处理
    // 发送到队列
    await this.queueService.pushEvent(event)
    return { success: true }
  }

  async trackEvents(events: Array<EventDto>) {
    // 批量上报机制
    events.forEach(async (item) => {
      await this.queueService.pushEvent(item)
    })
    return { sucess: true }
  }
  // 获取事件
  async getEvents(
    type: string,
    time: string,
    startTime?: string,
    endTime?: string,
    limit?: number
  ) {
    return await this.processingService.getEvents(type, time, startTime, endTime, limit)
  }
  //获取对应所有事件的接口
  async getEventList(type: string) {
    return await this.processingService.getEventList(type)
  }

  //分析特定时间事件
  async analyzeEvent(type: string, time: string, startTime?: string, endTime?: string) {
    return await this.processingService.analyzeEvent(type, time, startTime, endTime)
  }

  // 更新事件
  async updateEvent(id: number, event: Partial<EventDto>) {
    return await this.databaseService.updateEvent(id, event)
  }

  // 删除事件
  async deleteEvent(id: number) {
    return await this.databaseService.deleteEvent(id)
  }

  // 获取单个事件
  async getEventById(id: number) {
    return await this.databaseService.getEventById(id)
  }
}
