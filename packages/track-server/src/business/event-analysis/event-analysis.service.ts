import { Injectable } from '@nestjs/common'
import { StorageService } from '../../storage/storage.service'
import { EventDto } from '../../common/dto/event'

@Injectable()
export class EventAnalysisService {
  constructor(private readonly storageService: StorageService) {}

  async processUserBehavior(event: EventDto) {
    // 这里可以添加具体的用户行为分析逻辑
    // 比如：判断是否是关键行为，更新用户画像等
    console.log(`Processing user behavior: ${event.type} for user ${event.userId}`)
    return await this.storageService.saveEvent(event)
  }

  async getUserBehaviors(userId: number) {
    // 这是一个简单的示例，实际情况可能需要调用 StorageService 的特定查询方法
    // 目前 StorageService.getEvents 是通过 params 过滤
    // 假设我们需要获取该用户的所有行为
    // 注意：需要在 StorageService/DatabaseService 中支持更多查询条件
    return await this.storageService.getEvents({ userId })
  }
}
