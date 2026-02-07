import { Controller, Post, Body, Get, Param, HttpException, HttpStatus } from '@nestjs/common'
import { UserService } from './user.service'
import { CreateUserDto } from './dto/create-user.dto'
import { LoginDto } from './dto/login.dto'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

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

  @Get(':id')
  async getUser(@Param('id') id: number) {
    return await this.userService.findOne(id)
  }
}
