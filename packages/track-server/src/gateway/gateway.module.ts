import { Module } from '@nestjs/common'
import { GatewayController } from './gateway.controller'
import { GatewayService } from './gateway.service'
import { RateLimitModule } from './rate-limit/rate-limit.module'
import { RouterModule } from './router/router.module'
import { QueueModule } from '../queue/queue.module'
import { ProcessingModule } from '../processing/processing.module'
import { StorageModule } from '../storage/storage.module'

@Module({
  imports: [RateLimitModule, RouterModule, QueueModule, ProcessingModule, StorageModule],
  controllers: [GatewayController],
  providers: [GatewayService],
  exports: [GatewayService],
})
export class GatewayModule {}
