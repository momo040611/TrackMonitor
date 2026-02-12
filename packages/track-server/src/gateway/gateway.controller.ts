import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiQuery, ApiBody, ApiResponse } from '@nestjs/swagger'
import { GatewayService } from './gateway.service'
import { EventDto } from '../common/dto/event'
import { AnalyzeParams } from '../common/dto/analyzeParams'
import { getEventParams } from '../common/dto/eventParams'

@ApiTags('埋点数据网关')
@Controller('gateway')
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @ApiOperation({ summary: '上传单个埋点事件', description: '用于前端应用上报单个埋点事件数据' })
  @ApiResponse({ status: 200, description: '上传成功', type: Object, example: { success: true } })
  @ApiBody({ type: EventDto, description: '埋点事件数据' })
  @Post('event')
  @HttpCode(HttpStatus.OK)
  async trackEvent(@Body() event: EventDto) {
    return this.gatewayService.trackEvent(event)
  }

  @ApiOperation({
    summary: '批量上传埋点事件',
    description: '用于前端应用批量上报多个埋点事件数据',
  })
  @ApiResponse({ status: 200, description: '上传成功', type: Object, example: { success: true } })
  @ApiBody({ type: [EventDto], description: '埋点事件数据数组' })
  @Post('events')
  @HttpCode(HttpStatus.OK)
  async trackEvents(@Body() events: Array<EventDto>) {
    return this.gatewayService.trackEvents(events)
  }

  @ApiOperation({ summary: '获取性能事件', description: '查询性能类型的事件数据' })
  @ApiQuery({ name: 'time', required: false, description: '时间范围，如 1d、1w、1m' })
  @ApiQuery({ name: 'startTime', required: false, description: '开始时间，ISO 8601 格式' })
  @ApiQuery({ name: 'endTime', required: false, description: '结束时间，ISO 8601 格式' })
  @ApiQuery({ name: 'limit', required: false, description: '返回记录数限制' })
  @ApiResponse({ status: 200, description: '查询成功', type: [EventDto] })
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

  @ApiOperation({ summary: '获取错误事件', description: '查询错误类型的事件数据' })
  @ApiQuery({ name: 'time', required: false, description: '时间范围，如 1d、1w、1m' })
  @ApiQuery({ name: 'startTime', required: false, description: '开始时间，ISO 8601 格式' })
  @ApiQuery({ name: 'endTime', required: false, description: '结束时间，ISO 8601 格式' })
  @ApiQuery({ name: 'limit', required: false, description: '返回记录数限制' })
  @ApiResponse({ status: 200, description: '查询成功', type: [EventDto] })
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

  @ApiOperation({ summary: '获取用户行为事件', description: '查询用户行为类型的事件数据' })
  @ApiQuery({ name: 'time', required: false, description: '时间范围，如 1d、1w、1m' })
  @ApiQuery({ name: 'startTime', required: false, description: '开始时间，ISO 8601 格式' })
  @ApiQuery({ name: 'endTime', required: false, description: '结束时间，ISO 8601 格式' })
  @ApiQuery({ name: 'limit', required: false, description: '返回记录数限制' })
  @ApiResponse({ status: 200, description: '查询成功', type: [EventDto] })
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

  @ApiOperation({ summary: '获取所有事件', description: '查询所有类型的事件数据' })
  @ApiQuery({ name: 'time', required: false, description: '时间范围，如 1d、1w、1m' })
  @ApiQuery({ name: 'startTime', required: false, description: '开始时间，ISO 8601 格式' })
  @ApiQuery({ name: 'endTime', required: false, description: '结束时间，ISO 8601 格式' })
  @ApiQuery({ name: 'limit', required: false, description: '返回记录数限制' })
  @ApiResponse({ status: 200, description: '查询成功', type: [EventDto] })
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

  @ApiOperation({ summary: '获取自定义事件', description: '根据事件类型查询事件数据' })
  @ApiQuery({
    name: 'type',
    required: false,
    description: '事件类型，如 error、performance、userBehavior，默认为 all',
  })
  @ApiQuery({ name: 'time', required: false, description: '时间范围，如 1d、1w、1m' })
  @ApiQuery({ name: 'startTime', required: false, description: '开始时间，ISO 8601 格式' })
  @ApiQuery({ name: 'endTime', required: false, description: '结束时间，ISO 8601 格式' })
  @ApiQuery({ name: 'limit', required: false, description: '返回记录数限制' })
  @ApiResponse({ status: 200, description: '查询成功', type: [EventDto] })
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

  @ApiOperation({
    summary: 'AI分析所有事件',
    description: '使用AI分析所有类型的事件数据，提供洞察和建议',
  })
  @ApiQuery({ name: 'time', required: false, description: '时间范围，如 1d、1w、1m' })
  @ApiQuery({ name: 'startTime', required: false, description: '开始时间，ISO 8601 格式' })
  @ApiQuery({ name: 'endTime', required: false, description: '结束时间，ISO 8601 格式' })
  @ApiResponse({
    status: 200,
    description: '分析成功',
    type: Object,
    example: { code: 200, data: '分析结果文本' },
  })
  @Get('analyzeAll')
  analyzeAll(@Query() getParams: getEventParams) {
    return this.gatewayService.analyzeEvent(
      'all',
      getParams.time,
      getParams.startTime,
      getParams.endTime
    )
  }

  @ApiOperation({
    summary: 'AI分析错误事件',
    description: '使用AI分析错误类型的事件数据，提供洞察和建议',
  })
  @ApiQuery({ name: 'time', required: false, description: '时间范围，如 1d、1w、1m' })
  @ApiQuery({ name: 'startTime', required: false, description: '开始时间，ISO 8601 格式' })
  @ApiQuery({ name: 'endTime', required: false, description: '结束时间，ISO 8601 格式' })
  @ApiResponse({
    status: 200,
    description: '分析成功',
    type: Object,
    example: { code: 200, data: '分析结果文本' },
  })
  @Get('analyzeError')
  analyzeError(@Query() getParams: getEventParams) {
    return this.gatewayService.analyzeEvent(
      'error',
      getParams.time,
      getParams.startTime,
      getParams.endTime
    )
  }

  @ApiOperation({
    summary: 'AI分析用户行为事件',
    description: '使用AI分析用户行为类型的事件数据，提供洞察和建议',
  })
  @ApiQuery({ name: 'time', required: false, description: '时间范围，如 1d、1w、1m' })
  @ApiQuery({ name: 'startTime', required: false, description: '开始时间，ISO 8601 格式' })
  @ApiQuery({ name: 'endTime', required: false, description: '结束时间，ISO 8601 格式' })
  @ApiResponse({
    status: 200,
    description: '分析成功',
    type: Object,
    example: { code: 200, data: '分析结果文本' },
  })
  @Get('analyzeUserBehavior')
  analyzeUserBehavior(@Query() getParams: getEventParams) {
    return this.gatewayService.analyzeEvent(
      'userBehavior',
      getParams.time,
      getParams.startTime,
      getParams.endTime
    )
  }

  @ApiOperation({
    summary: 'AI分析性能事件',
    description: '使用AI分析性能类型的事件数据，提供洞察和建议',
  })
  @ApiQuery({ name: 'time', required: false, description: '时间范围，如 1d、1w、1m' })
  @ApiQuery({ name: 'startTime', required: false, description: '开始时间，ISO 8601 格式' })
  @ApiQuery({ name: 'endTime', required: false, description: '结束时间，ISO 8601 格式' })
  @ApiResponse({
    status: 200,
    description: '分析成功',
    type: Object,
    example: { code: 200, data: '分析结果文本' },
  })
  @Get('analyzePerformance')
  analyzePerformance(@Query() getParams: AnalyzeParams) {
    return this.gatewayService.analyzeEvent(
      'performance',
      getParams.time,
      getParams.startTime,
      getParams.endTime
    )
  }

  @ApiOperation({ summary: '获取单个埋点事件', description: '根据ID获取单个埋点事件详情' })
  @ApiQuery({ name: 'id', required: true, description: '埋点事件ID' })
  @ApiResponse({ status: 200, description: '获取成功', type: EventDto })
  @ApiResponse({ status: 404, description: '事件不存在' })
  @Get('getEventById')
  getEventById(@Query('id') id: number) {
    return this.gatewayService.getEventById(id)
  }

  @ApiOperation({ summary: '更新埋点事件', description: '更新指定的埋点事件数据' })
  @ApiQuery({ name: 'id', required: true, description: '埋点事件ID' })
  @ApiBody({ type: EventDto, description: '埋点事件数据（支持部分更新）' })
  @ApiResponse({ status: 200, description: '更新成功', type: EventDto })
  @ApiResponse({ status: 404, description: '事件不存在' })
  @Put('updateEvent')
  updateEvent(@Query('id') id: number, @Body() event: Partial<EventDto>) {
    return this.gatewayService.updateEvent(id, event)
  }

  @ApiOperation({ summary: '删除埋点事件', description: '删除指定的埋点事件' })
  @ApiQuery({ name: 'id', required: true, description: '埋点事件ID' })
  @ApiResponse({ status: 200, description: '删除成功', type: Object, example: { success: true } })
  @ApiResponse({ status: 404, description: '事件不存在' })
  @Delete('deleteEvent')
  deleteEvent(@Query('id') id: number) {
    return this.gatewayService.deleteEvent(id)
  }
}
