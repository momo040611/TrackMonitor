import { Injectable, UnauthorizedException } from '@nestjs/common'
import { UserService } from '../user/user.service'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { LoginDto } from '../user/dto/login.dto'

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userService.findOneByUsername(username)

    // 修复1：先校验用户存在，再兜底 password 为空字符串（避免 undefined）
    if (!user) {
      return null
    }

    // 修复2：兜底 user.password 为空字符串，确保传给 bcrypt.compare 的是 string 类型
    const userPassword = user.password || ''
    const isPasswordValid = await bcrypt.compare(pass, userPassword)

    if (isPasswordValid) {
      const { password, ...result } = user
      return result
    }

    return null
  }

  async login(loginDto: LoginDto) {
    // 前置校验：入参不能为空（兜底，避免空值传递）
    if (!loginDto.username || !loginDto.password) {
      throw new UnauthorizedException('Username and password are required')
    }

    const user = await this.validateUser(loginDto.username, loginDto.password)
    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const payload = { username: user.username, sub: user.id }
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
      user: user,
    }
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token)
      // 重新签发
      const newPayload = { username: payload.username, sub: payload.sub }
      return {
        access_token: this.jwtService.sign(newPayload),
        refresh_token: this.jwtService.sign(newPayload, { expiresIn: '7d' }),
      }
    } catch (e) {
      throw new UnauthorizedException('Invalid Refresh Token')
    }
  }
}
