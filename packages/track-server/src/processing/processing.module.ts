import { Module } from '@nestjs/common'
import { ProcessingController } from './processing.controller'
import { ProcessingService } from './processing.service'
import { BusinessModule } from '../business/business.module'
@Module({
  imports: [BusinessModule],
  controllers: [ProcessingController],
  providers: [ProcessingService],
  exports: [ProcessingService],
})
export class ProcessingModule {}
