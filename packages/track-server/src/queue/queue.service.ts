import { Injectable } from '@nestjs/common'
import { ProcessingService } from '../processing/processing.service'

@Injectable()
export class QueueService {
  private readonly queue: any[] = []

  constructor(private readonly processingService: ProcessingService) {}

  async pushEvent(event: any): Promise<void> {
    // 推送事件到队列
    console.log('添加到队列', event)
    this.queue.push(event)
    if (this.queue.length > 0) {
      this.processQueue()
    }
  }

  async processQueue(): Promise<void> {
    // 处理队列逻辑
    console.log('处理队列')
    while (this.queue.length > 0) {
      await this.processingService.processEvent(this.queue.shift())
    }
  }
}
