import { IsJSON, IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export enum EventPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export class EventDto {
  @ApiProperty({ description: '事件类型' })
  @IsString()
  @IsNotEmpty()
  type: string

  @ApiProperty({ description: '事件数据' })
  @IsJSON()
  @IsNotEmpty()
  data: JSON

  @ApiProperty({ description: '页面URL', required: false })
  @IsString()
  @IsOptional()
  url: string

  @ApiProperty({ description: '优先级', enum: EventPriority, required: false })
  @IsString()
  @IsOptional()
  priority: EventPriority

  @ApiProperty({ description: '用户ID', required: false })
  @IsNumber()
  @IsOptional()
  userId: number

  @ApiProperty({ description: '会话ID', required: false })
  @IsString()
  @IsOptional()
  sessionId: string
}
