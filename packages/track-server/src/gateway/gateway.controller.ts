import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common'
import { GatewayService } from './gateway.service'

@Controller('gateway')
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  //埋点数据上传相关接口
  @Post('track')
  @HttpCode(HttpStatus.OK)
  async trackEvent(@Body() event: any) {
    //接收到前端的埋点数据
    console.log('接收层')
    return this.gatewayService.trackEvent(event)
  }
}
