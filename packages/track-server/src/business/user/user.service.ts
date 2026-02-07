// 1. 新增 BadRequestException 导入
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UserEntity } from '../../storage/database/entities/user.entity'
import { CreateUserDto } from './dto/create-user.dto'
import { LoginDto } from './dto/login.dto'
import * as bcrypt from 'bcrypt'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>
  ) {}

  async register(createUserDto: CreateUserDto): Promise<UserEntity> {
    // 1. 先校验密码必传（即使DTO有校验，服务层做兜底）
    if (!createUserDto.password) {
      throw new BadRequestException('Password is required')
    }

    const existingUser = await this.userRepository.findOne({
      where: { username: createUserDto.username },
    })
    if (existingUser) {
      throw new ConflictException('Username is already taken')
    }

    // 2. 密码加密（固定加盐轮数，避免异步类型问题）
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds)

    // 3. 创建用户（确保类型匹配）
    const newUser = this.userRepository.create({
      username: createUserDto.username,
      password: hashedPassword,
      email: createUserDto.email || '', // 兜底空字符串，避免undefined
    })
    return await this.userRepository.save(newUser)
  }

  // 4. 补充login方法（控制器调用的核心）
  async login(loginDto: LoginDto): Promise<{ user: Omit<UserEntity, 'password'>; token?: string }> {
    // 校验入参
    if (!loginDto.username || !loginDto.password) {
      throw new UnauthorizedException('Username and password are required')
    }

    // 查询用户（统一返回null，避免undefined/null混用）
    const user = await this.userRepository.findOne({
      where: { username: loginDto.username },
    })
    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }

    // 2. 修复 user.password 可能为 undefined 的问题：兜底空字符串
    const userPassword = user.password || ''
    // 校验密码（使用兜底后的字符串，避免类型报错）
    const isPasswordValid = await bcrypt.compare(loginDto.password, userPassword)
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials')
    }

    // 返回用户信息（剔除密码）
    const { password, ...userInfo } = user
    return { user: userInfo } // 后续加JWT时补充token
  }

  // 5. 统一返回类型为 null（避免undefined/null混用）
  async findOneByUsername(username: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { username } })
  }

  async findOne(id: number): Promise<UserEntity | null> {
    return await this.userRepository.findOne({ where: { id } })
  }
}
