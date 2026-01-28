import { Injectable } from '@nestjs/common'

@Injectable()
export class BusinessService {
  getAnalysis(params: any): any {
    // 分析逻辑
    return { data: [], total: 0 }
  }

  createAlert(alert: any): any {
    // 创建告警逻辑
    return { id: 1, ...alert }
  }

  processEvent(event: any): void {
    // 处理事件逻辑
    console.log('业务层 处理事件...')
  }
}
