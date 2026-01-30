import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DatabaseService } from './database.service'
import { EventEntity } from './entities/event.entity'

@Module({
  imports: [TypeOrmModule.forFeature([EventEntity])],
  providers: [DatabaseService],
  exports: [
    DatabaseService,
    TypeOrmModule.forFeature([EventEntity]), // 关键：导出 Repository
  ],
})
export class DatabaseModule {}
