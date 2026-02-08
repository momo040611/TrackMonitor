import { Injectable } from '@nestjs/common'
import { AIService } from '../ai.service'
import { StorageService } from 'src/storage/storage.service'

@Injectable()
export class AnalyzeWokerService {
  constructor(
    private readonly aiService: AIService,
    private readonly storageService: StorageService
  ) {}

  // 分析数据库内事件
  async analyzeEvent({ type, time, startTime, endTime }): Promise<string> {
    try {
      const events = await this.storageService.getEvents({ type, time, startTime, endTime })
      console.log(events)
      const prompt = `请分析以下事件数据，${type ? `仅包含${type}类型事件` : ''}，${time ? `最近${time}` : ''}，${startTime && endTime ? `在${startTime}至${endTime}之间` : ''}。`
      return await this.aiService.analyzeEvent(prompt, events)
    } catch (error) {
      console.error('AI分析事件失败:', error)
      throw new Error(`AI分析事件失败: ${error.message}`)
    }
  }
}
