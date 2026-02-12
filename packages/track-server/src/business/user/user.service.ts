// 1. 新增 BadRequestException 导入
import { Injectable, ConflictException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UserEntity } from '../../storage/database/entities/user.entity'
import { CreateUserDto } from './dto/create-user.dto'
import * as bcrypt from 'bcrypt'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>
  ) {}

  async register(createUserDto: CreateUserDto): Promise<UserEntity> {
    if (!createUserDto.password) {
      throw new BadRequestException('Password is required')
    }

    const existingUser = await this.userRepository.findOne({
      where: { username: createUserDto.username },
    })
    if (existingUser) {
      throw new ConflictException('Username is already taken')
    }

    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds)

    const newUser = this.userRepository.create({
      username: createUserDto.username,
      password: hashedPassword,
      email: createUserDto.email || '',
    })
    return await this.userRepository.save(newUser)
  }

  async findOneByUsername(username: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { username } })
  }

  async findOne(id: number): Promise<UserEntity | null> {
    return await this.userRepository.findOne({ where: { id } })
  }

  async checkUsername(username: string): Promise<{ available: boolean }> {
    const existingUser = await this.userRepository.findOne({
      where: { username },
    })
    return { available: !existingUser }
  }
}
