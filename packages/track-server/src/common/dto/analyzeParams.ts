import { IsOptional, IsString } from 'class-validator'

export class AnalyzeParams {
  @IsString()
  @IsOptional()
  time: string

  @IsOptional()
  @IsString()
  startTime?: string // 绝对时间区间-开始：ISO 8601 格式

  @IsOptional()
  @IsString()
  endTime?: string // 绝对时间区间-结束：ISO 8601 格式
}
