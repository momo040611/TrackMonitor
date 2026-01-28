import { Injectable } from '@nestjs/common'

@Injectable()
export class DatabaseService {
  async saveEvent(event: any): Promise<void> {
    // 存储事件逻辑
  }

  async getEvents(params: any): Promise<any[]> {
    // 获取事件逻辑
    return []
  }
}
