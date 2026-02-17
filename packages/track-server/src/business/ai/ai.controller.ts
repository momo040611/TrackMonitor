import { Controller, Get, Query } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger'
import { AnalyzeWokerService } from './wokers/analyzeWoker.service'
import { getEventParams } from '../../common/dto/eventParams'
import { AnalyzeParams } from '../../common/dto/analyzeParams'

@ApiTags('AI分析')
@Controller('ai')
export class AIController {
  constructor(private readonly analyzeWokerService: AnalyzeWokerService) {}

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
    return this.analyzeWokerService.analyzeEvent({
      type: 'all',
      time: getParams.time,
      startTime: getParams.startTime,
      endTime: getParams.endTime,
    })
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
    return this.analyzeWokerService.analyzeEvent({
      type: 'error',
      time: getParams.time,
      startTime: getParams.startTime,
      endTime: getParams.endTime,
    })
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
    return this.analyzeWokerService.analyzeEvent({
      type: 'userBehavior',
      time: getParams.time,
      startTime: getParams.startTime,
      endTime: getParams.endTime,
    })
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
    return this.analyzeWokerService.analyzeEvent({
      type: 'performance',
      time: getParams.time,
      startTime: getParams.startTime,
      endTime: getParams.endTime,
    })
  }
}
