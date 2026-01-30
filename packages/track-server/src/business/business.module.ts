import { Module } from '@nestjs/common'
import { BusinessController } from './business.controller'
import { BusinessService } from './business.service'
import { PerformanceModule } from './performance-analysis/performance.module'

@Module({
  imports: [PerformanceModule],
  controllers: [BusinessController],
  providers: [BusinessService],
  exports: [BusinessService],
})
export class BusinessModule {}
