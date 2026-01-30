import { Injectable } from '@nestjs/common'
import { QueueService } from '../queue/queue.service'
import { EventDto } from '../dto/event'

@Injectable()
export class GatewayService {
  constructor(private readonly queueService: QueueService) {}

  async trackEvent(event: EventDto): Promise<{ success: boolean }> {
    // 验证、限流等处理
    // 发送到队列
    await this.queueService.pushEvent(event)
    return { success: true }
  }
}
