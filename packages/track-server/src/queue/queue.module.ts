import { Module } from '@nestjs/common'
import { QueueService } from './queue.service'
import { ProcessingModule } from '../processing/processing.module'

@Module({
  imports: [ProcessingModule],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {}
