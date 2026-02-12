import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  HttpException,
  HttpStatus,
  Inject,
  forwardRef,
} from '@nestjs/common'
import { UserService } from './user.service'
import { AuthService } from '../auth/auth.service'
import { CreateUserDto } from './dto/create-user.dto'
import { LoginDto } from './dto/login.dto'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'

@ApiTags('用户模块')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService
  ) {}

  @ApiOperation({ summary: '用户注册', description: '创建新用户账号' })
  @ApiResponse({ status: 201, description: '注册成功' })
  @ApiResponse({ status: 400, description: '用户名已存在或参数错误' })
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    try {
      return await this.userService.register(createUserDto)
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  @ApiOperation({ summary: '用户登录', description: '用户登录并返回访问令牌' })
  @ApiResponse({
    status: 200,
    description: '登录成功',
    type: Object,
    example: { access_token: '...', user: { id: 1, username: 'admin' } },
  })
  @ApiResponse({ status: 401, description: '用户名或密码错误' })
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    try {
      return await this.authService.login(loginDto)
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED)
    }
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '获取用户信息', description: '根据用户ID获取用户详细信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @Get(':id')
  async getUser(@Param('id') id: number) {
    return await this.userService.findOne(id)
  }

  @ApiOperation({ summary: '检查用户名', description: '检查用户名是否已被使用' })
  @ApiResponse({ status: 200, description: '检查成功', type: Object, example: { available: true } })
  @ApiResponse({ status: 400, description: '参数错误' })
  @Post('check-username')
  async checkUsername(@Body('username') username: string) {
    try {
      if (!username) {
        throw new HttpException('Username is required', HttpStatus.BAD_REQUEST)
      }
      return await this.userService.checkUsername(username)
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }
}
