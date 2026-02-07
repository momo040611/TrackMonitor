import { Module } from '@nestjs/common'
import { StorageModule } from 'src/storage/storage.module'
import { AnalyzeWokerService } from './analyzeWoker.service'
import { AIService } from '../ai.service'

@Module({
  imports: [StorageModule],
  providers: [AnalyzeWokerService, AIService],
  exports: [AnalyzeWokerService],
})
export class AnalyzeModule {}
