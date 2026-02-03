import { Controller, Post, Get, Body, Query, HttpCode, HttpStatus, UsePipes } from '@nestjs/common'
import { GatewayService } from './gateway.service'
import { EventDto } from '../common/dto/event'
import { getEventParams } from '../common/dto/eventParams'
import { EventPipe } from '../common/pipes/event.pipe'

@Controller('gateway')
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  //埋点数据上传相关接口
  @Post('event')
  @UsePipes(new EventPipe())
  @HttpCode(HttpStatus.OK)
  async trackEvent(@Body() event: EventDto) {
    return this.gatewayService.trackEvent(event)
  }

  //批量上传接口
  @Post('events')
  @HttpCode(HttpStatus.OK)
  async trackEvents(@Body() events: Array<EventDto>) {
    return this.gatewayService.trackEvents(events)
  }

  //获取性能事件
  @Get('getPerformance')
  getPerformance(@Query() getParams: getEventParams) {
    return this.gatewayService.getEvents('performance', getParams.time, getParams.limit)
  }

  //获取错误事件
  @Get('getError')
  getError(@Query() getParams: getEventParams) {
    return this.gatewayService.getEvents('error', getParams.time, getParams.limit)
  }

  //获取用户行为事件
  @Get('getUserBehavior')
  getUserBehavior(@Query() getParams: getEventParams) {
    return this.gatewayService.getEvents('userBehavior', getParams.time, getParams.limit)
  }

  //获取所有事件
  @Get('getAll')
  getAll(@Query() getParams: getEventParams) {
    return this.gatewayService.getEvents('all', getParams.time, getParams.limit)
  }

  //获取自定义事件
  @Get('getEvent')
  getEvent(@Query() getParams: getEventParams) {
    return this.gatewayService.getEvents(getParams.type || 'all', getParams.time, getParams.limit)
  }
}
