import { Injectable, UnauthorizedException } from '@nestjs/common'
import { UserService } from '../user/user.service'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { LoginDto } from './dto/login.dto'

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userService.findOneByUsername(username)

    if (!user) {
      return null
    }

    const userPassword = user.password || ''
    const isPasswordValid = await bcrypt.compare(pass, userPassword)

    if (isPasswordValid) {
      const { password, ...result } = user
      return result
    }

    return null
  }

  async login(loginDto: LoginDto) {
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
      user: user,
    }
  }
}
