import { IsJSON, IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator'

export enum EventPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export class EventDto {
  @IsString()
  @IsNotEmpty()
  type: string

  @IsJSON()
  @IsNotEmpty()
  data: JSON

  @IsString()
  @IsOptional()
  url: string

  @IsString()
  @IsOptional()
  priority: EventPriority

  @IsNumber()
  @IsOptional()
  userId: number
}
