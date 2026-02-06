import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { GatewayModule } from './gateway/gateway.module'
import { ProcessingModule } from './processing/processing.module'
import { BusinessModule } from './business/business.module'
import { QueueModule } from './queue/queue.module'
import { GatewayController } from './gateway/gateway.controller'
import { TypeOrmModule } from '@nestjs/typeorm'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
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
