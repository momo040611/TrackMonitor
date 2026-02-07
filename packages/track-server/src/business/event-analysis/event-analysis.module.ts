import { Module } from '@nestjs/common'
import { EventAnalysisService } from './event-analysis.service'
import { StorageModule } from '../../storage/storage.module'

@Module({
  imports: [StorageModule],
  providers: [EventAnalysisService],
  exports: [EventAnalysisService],
})
export class EventAnalysisModule {}
