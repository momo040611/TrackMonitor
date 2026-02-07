import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DatabaseService } from './database.service'
import { EventEntity } from './entities/event.entity'
import { UserEntity } from './entities/user.entity'
import { UserActivityStatsEntity } from './entities/user-activity-stats.entity'

@Module({
  imports: [TypeOrmModule.forFeature([EventEntity, UserEntity, UserActivityStatsEntity])],
  providers: [DatabaseService],
  exports: [
    DatabaseService,
    TypeOrmModule.forFeature([EventEntity, UserEntity, UserActivityStatsEntity]), // 关键：导出 Repository
  ],
})
export class DatabaseModule {}
