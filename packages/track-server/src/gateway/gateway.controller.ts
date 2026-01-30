import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common'
import { GatewayService } from './gateway.service'
import { EventDto } from '../dto/event'

@Controller('gateway')
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  //埋点数据上传相关接口
  @Post('event')
  @HttpCode(HttpStatus.OK)
  async trackEvent(@Body() event: EventDto) {
    console.log(event)
    return this.gatewayService.trackEvent(event)
  }
}
