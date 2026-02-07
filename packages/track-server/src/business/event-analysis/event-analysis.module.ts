import { Module } from '@nestjs/common'
import { EventAnalysisService } from './event-analysis.service'
import { StorageModule } from '../../storage/storage.module'
import { DatabaseModule } from '../../storage/database/database.module'

@Module({
  imports: [StorageModule, DatabaseModule],
  providers: [EventAnalysisService],
  exports: [EventAnalysisService],
})
export class EventAnalysisModule {}
