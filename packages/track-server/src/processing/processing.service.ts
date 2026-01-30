import { Injectable } from '@nestjs/common'
import { BusinessService } from '../business/business.service'
import { EventDto } from '../dto/event'

@Injectable()
export class ProcessingService {
  constructor(private readonly businessService: BusinessService) {}

  async processEvent(event: EventDto): Promise<void> {
    // 数据验证
    // 数据转换
    // 存储到数据库（暂时注释，等待数据库配置）
    console.log('数据存储 加工...')
    // 调用业务层
    await this.businessService.processEvent(event)
  }
}
