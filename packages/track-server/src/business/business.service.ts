import { Injectable } from '@nestjs/common'
import { PerformanceService } from './performance-analysis/performance.service'
import { EventDto } from '../common/dto/event'
import { StorageService } from '../storage/storage.service'
import { ErrorService } from './error-analysis/error.service'

@Injectable()
export class BusinessService {
  constructor(
    private readonly performanceService: PerformanceService,
    private readonly storageService: StorageService,
    private readonly errorService: ErrorService
  ) {}

  getAnalysis(params: any): any {
    // 分析逻辑
    return { data: [], total: 0 }
  }

  createAlert(alert: any): any {
    // 创建告警逻辑
    return { id: 1, ...alert }
  }

  async reportErrorEvent(event: EventDto): Promise<void> {
    // 调用 ErrorService 上报错误事件
    await this.errorService.reportErrorEvent(event)
  }
}
