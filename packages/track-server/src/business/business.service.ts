import { Injectable } from '@nestjs/common'
import { PerformanceService } from './performance-analysis/performance.service'
import { EventDto } from '../dto/event'

@Injectable()
export class BusinessService {
  constructor(private readonly performanceService: PerformanceService) {}

  getAnalysis(params: any): any {
    // 分析逻辑
    return { data: [], total: 0 }
  }

  createAlert(alert: any): any {
    // 创建告警逻辑
    return { id: 1, ...alert }
  }

  async processEvent(event: EventDto): Promise<void> {
    // 处理事件逻辑
    if (event.type === 'performance') {
      // 处理性能事件
      await this.performanceService.analyzePerformance(event)
    } else if (event.type === 'error') {
      // 处理错误事件
    } else if (event.type === 'user') {
      // 处理用户事件
    }
  }
}
