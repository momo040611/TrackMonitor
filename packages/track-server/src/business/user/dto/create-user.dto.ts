import { IsString, IsNotEmpty, IsOptional, IsEmail, MinLength } from 'class-validator'

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: '用户名不能为空' })
  username: string

  @IsString()
  @IsNotEmpty({ message: '密码不能为空' }) // 改为必填
  @MinLength(6, { message: '密码长度不能少于6位' })
  password: string // 去掉?，改为必填

  @IsOptional()
  @IsEmail({}, { message: '邮箱格式不正确' })
  email?: string
}
