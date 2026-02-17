import { Module } from '@nestjs/common'
import { StorageModule } from 'src/storage/storage.module'
import { AnalyzeWokerService } from './analyzeWoker.service'
import { AIService } from '../ai.service'
import { AIController } from '../ai.controller'

@Module({
  imports: [StorageModule],
  providers: [AnalyzeWokerService, AIService],
  controllers: [AIController],
  exports: [AnalyzeWokerService],
})
export class AnalyzeModule {}
