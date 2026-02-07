import { Module } from '@nestjs/common'
import { BusinessController } from './business.controller'
import { BusinessService } from './business.service'
import { PerformanceModule } from './performance-analysis/performance.module'
import { StorageModule } from '../storage/storage.module'
import { ErrorModule } from './error-analysis/error.module'
import { UserModule } from './user/user.module'
import { EventAnalysisModule } from './event-analysis/event-analysis.module'

@Module({
  imports: [PerformanceModule, StorageModule, ErrorModule, UserModule, EventAnalysisModule],
  controllers: [BusinessController],
  providers: [BusinessService],
  exports: [BusinessService],
})
export class BusinessModule {}
