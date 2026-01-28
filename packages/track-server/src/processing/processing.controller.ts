import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common'
import { ProcessingService } from './processing.service'

@Controller('processing')
export class ProcessingController {
  constructor(private readonly processingService: ProcessingService) {}

  @Post('event')
  @HttpCode(HttpStatus.OK)
  async processEvent(@Body() event: any) {
    await this.processingService.processEvent(event)
    return { success: true }
  }
}
