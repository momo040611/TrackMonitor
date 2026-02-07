import { IsString, IsNotEmpty, IsOptional, IsEmail, MinLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateUserDto {
  @ApiProperty({ description: '用户名' })
  @IsString()
  @IsNotEmpty({ message: '用户名不能为空' })
  username: string

  @ApiProperty({ description: '密码', minLength: 6 })
  @IsString()
  @IsNotEmpty({ message: '密码不能为空' }) // 改为必填
  @MinLength(6, { message: '密码长度不能少于6位' })
  password: string // 去掉?，改为必填

  @ApiProperty({ description: '邮箱', required: false })
  @IsOptional()
  @IsEmail({}, { message: '邮箱格式不正确' })
  email?: string
}
