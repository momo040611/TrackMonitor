import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UserEntity } from '../../storage/database/entities/user.entity'
import { CreateUserDto } from './dto/create-user.dto'
import { LoginDto } from './dto/login.dto'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>
  ) {}

  async register(createUserDto: CreateUserDto): Promise<UserEntity> {
    const existingUser = await this.userRepository.findOne({
      where: { username: createUserDto.username },
    })
    if (existingUser) {
      throw new ConflictException('Username is already taken')
    }

    const newUser = this.userRepository.create(createUserDto)
    // In a real app, hash password here: await bcrypt.hash(newUser.password, 10);
    return await this.userRepository.save(newUser)
  }

  async login(loginDto: LoginDto): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { username: loginDto.username },
    })

    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }

    // In a real app, check password match: await bcrypt.compare(loginDto.password, user.password);
    if (loginDto.password && user.password !== loginDto.password) {
      throw new UnauthorizedException('Invalid credentials')
    }

    // Return user info or JWT token
    const { password, ...result } = user
    return result
  }

  async findOne(id: number): Promise<UserEntity | null> {
    return await this.userRepository.findOne({ where: { id } })
  }
}
