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
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.sql_host,
      port: Number(process.env.sql_port),
      username: process.env.sql_user,
      password: process.env.sql_password,
      database: process.env.sql_database,
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
