import { Injectable } from '@nestjs/common'
import { EventDto } from '../../dto/event'
import { StorageService } from '../../storage/storage.service'

@Injectable()
export class PerformanceService {
  constructor(private readonly storageService: StorageService) {}

  async analyzePerformance(event: EventDto): Promise<void> {
    // 将事件存入数据库
    await this.storageService.saveEvent(event)
  }
}
