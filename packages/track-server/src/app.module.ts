import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { GatewayModule } from './gateway/gateway.module'
import { ProcessingModule } from './processing/processing.module'
import { BusinessModule } from './business/business.module'
import { QueueModule } from './queue/queue.module'
import { GatewayController } from './gateway/gateway.controller'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GatewayModule,
    ProcessingModule,
    BusinessModule,
    QueueModule,
  ],
  controllers: [AppController, GatewayController],
  providers: [AppService],
})
export class AppModule {}
