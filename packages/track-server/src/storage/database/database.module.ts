import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DatabaseService } from './database.service'
import { EventEntity } from './entities/event.entity'
import { PerformanceEvent } from './performance.entity' // [!code ++] 新增

@Module({
  imports: [
    TypeOrmModule.forFeature([EventEntity, PerformanceEvent]), // [!code ++] 注册进这里
  ],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
