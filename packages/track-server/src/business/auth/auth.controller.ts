import { Controller, Get, UseGuards, Request } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from './guards/jwt-auth.guard'

@ApiTags('认证模块')
@Controller('auth')
export class AuthController {
  @ApiOperation({ summary: '获取当前用户信息', description: '根据当前访问令牌获取用户信息' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: Object,
    example: { userId: 1, username: 'admin' },
  })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user
  }
}
