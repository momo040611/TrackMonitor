import { Module } from '@nestjs/common'
import { ProcessingController } from './processing.controller'
import { ProcessingService } from './processing.service'
import { BusinessModule } from '../business/business.module'
import { StorageModule } from '../storage/storage.module'
import { AnalyzeModule } from '../business/ai/wokers/anayze.module'

@Module({
  imports: [BusinessModule, StorageModule, AnalyzeModule],
  controllers: [ProcessingController],
  providers: [ProcessingService],
  exports: [ProcessingService],
})
export class ProcessingModule {}
