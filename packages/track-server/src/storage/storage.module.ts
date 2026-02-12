import { Module } from '@nestjs/common'
import { StorageService } from './storage.service'
import { DatabaseModule } from './database/database.module'
import { RedisModule } from './redis/redis.module'

@Module({
  imports: [DatabaseModule, RedisModule],
  providers: [StorageService],
  exports: [StorageService, DatabaseModule],
})
export class StorageModule {}
