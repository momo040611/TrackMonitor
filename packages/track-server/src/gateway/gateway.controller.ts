import { Controller, Post, Get, Body, Query, HttpCode, HttpStatus, UsePipes } from '@nestjs/common'
import { GatewayService } from './gateway.service'
import { EventDto } from '../common/dto/event'
import { AnalyzeParams } from '../common/dto/analyzeParams'
import { getEventParams } from '../common/dto/eventParams'

@Controller('gateway')
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  //埋点数据上传相关接口
  @Post('event')
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
    return this.gatewayService.getEvents(
      'performance',
      getParams.time,
      getParams.startTime,
      getParams.endTime,
      getParams.limit
    )
  }

  //获取错误事件
  @Get('getError')
  getError(@Query() getParams: getEventParams) {
    return this.gatewayService.getEvents(
      'error',
      getParams.time,
      getParams.startTime,
      getParams.endTime,
      getParams.limit
    )
  }

  //获取用户行为事件
  @Get('getUserBehavior')
  getUserBehavior(@Query() getParams: getEventParams) {
    return this.gatewayService.getEvents(
      'userBehavior',
      getParams.time,
      getParams.startTime,
      getParams.endTime,
      getParams.limit
    )
  }

  //获取所有事件
  @Get('getAll')
  getAll(@Query() getParams: getEventParams) {
    return this.gatewayService.getEvents(
      'all',
      getParams.time,
      getParams.startTime,
      getParams.endTime,
      getParams.limit
    )
  }

  //获取自定义事件
  @Get('getEvent')
  getEvent(@Query() getParams: getEventParams) {
    return this.gatewayService.getEvents(
      getParams.type || 'all',
      getParams.time,
      getParams.startTime,
      getParams.endTime,
      getParams.limit
    )
  }

  //获取分析所有事件
  @Get('analyzeAll')
  analyzeAll(@Query() getParams: getEventParams) {
    return this.gatewayService.analyzeEvent(
      'all',
      getParams.time,
      getParams.startTime,
      getParams.endTime
    )
  }

  //获取分析错误事件
  @Get('analyzeError')
  analyzeError(@Query() getParams: getEventParams) {
    return this.gatewayService.analyzeEvent(
      'error',
      getParams.time,
      getParams.startTime,
      getParams.endTime
    )
  }

  //获取分析用户行为事件
  @Get('analyzeUserBehavior')
  analyzeUserBehavior(@Query() getParams: getEventParams) {
    return this.gatewayService.analyzeEvent(
      'userBehavior',
      getParams.time,
      getParams.startTime,
      getParams.endTime
    )
  }

  //获取分析性能事件
  @Get('analyzePerformance')
  analyzePerformance(@Query() getParams: AnalyzeParams) {
    return this.gatewayService.analyzeEvent(
      'performance',
      getParams.time,
      getParams.startTime,
      getParams.endTime
    )
  }
}
