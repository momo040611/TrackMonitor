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

import { RefreshTokenDto } from '../auth/dto/refresh-token.dto'

@ApiTags('用户模块')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService
  ) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    try {
      return await this.userService.register(createUserDto)
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    try {
      return await this.userService.login(loginDto)
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED)
    }
  }

  @ApiOperation({ summary: '刷新Token' })
  @Post('refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    try {
      return await this.authService.refreshToken(refreshTokenDto.refresh_token)
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED)
    }
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '获取用户信息' })
  @Get(':id')
  async getUser(@Param('id') id: number) {
    return await this.userService.findOne(id)
  }
}
