import { Injectable } from '@nestjs/common'
import { DatabaseService } from '../storage/database/database.service'

@Injectable()
export class BusinessService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getAnalysis(params: any): Promise<any> {
    const { type, name, startTime, endTime } = params

    // 设置默认查询范围：如果前端没传，默认查询过去 24 小时
    const end = endTime ? Number(endTime) : Date.now()
    const start = startTime ? Number(startTime) : end - 24 * 60 * 60 * 1000

    // 调用 DatabaseService 中我们写好的聚合查询方法
    const trendData = await this.databaseService.getPerformanceAnalysis(type, name, start, end)

    return {
      total: trendData.length,
      data: trendData,
      meta: {
        type,
        name,
        range: { start, end },
      },
    }
  }

  /**
   * 处理事件流入口
   * 负责识别上报的事件类型，并将性能数据分流到对应的分析表中
   */
  async processEvent(event: any): Promise<void> {
    console.log(`业务层 收到事件类型: ${event.type}`)

    if (event.type === 'performance' && event.data) {
      console.log('>> 检测到性能指标，正在执行分流存储...')
      await this.databaseService.savePerformanceEvent(event.data)
    }

    if (event.type === 'error') {
      await this.reportErrorEvent(event)
    }
  }

  async reportErrorEvent(event: any): Promise<void> {
    console.log('业务层 处理错误告警...', event)

    this.createAlert({
      level: 'high',
      msg: `检测到异常错误: ${event.data?.message || '未知错误'}`,
      time: new Date(),
    })
  }

  createAlert(alert: any): any {
    // 暂时模拟返回
    return { id: Math.random().toString(36).substr(2, 9), ...alert }
  }
}
