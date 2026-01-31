import { Module } from '@nestjs/common'
import { GatewayController } from './gateway.controller'
import { GatewayService } from './gateway.service'
import { AuthModule } from './auth/auth.module'
import { RateLimitModule } from './rate-limit/rate-limit.module'
import { RouterModule } from './router/router.module'
import { QueueModule } from '../queue/queue.module'
import { ProcessingModule } from '../processing/processing.module'

@Module({
  imports: [AuthModule, RateLimitModule, RouterModule, QueueModule, ProcessingModule],
  controllers: [GatewayController],
  providers: [GatewayService],
  exports: [GatewayService],
})
export class GatewayModule {}
