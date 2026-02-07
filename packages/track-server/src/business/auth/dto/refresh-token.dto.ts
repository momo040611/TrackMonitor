import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class RefreshTokenDto {
  @ApiProperty({ description: '刷新Token' })
  @IsString()
  @IsNotEmpty()
  refresh_token: string
}
