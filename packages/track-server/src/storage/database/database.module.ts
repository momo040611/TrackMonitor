import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DatabaseService } from './database.service'
import { EventEntity } from './entities/event.entity'
import { UserEntity } from './entities/user.entity'

@Module({
  imports: [TypeOrmModule.forFeature([EventEntity, UserEntity])],
  providers: [DatabaseService],
  exports: [
    DatabaseService,
    TypeOrmModule.forFeature([EventEntity, UserEntity]), // 关键：导出 Repository
  ],
})
export class DatabaseModule {}
