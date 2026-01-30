import { Module } from '@nestjs/common'
import { PerformanceService } from './performance.service'
import { StorageModule } from '../../storage/storage.module'

@Module({
  imports: [StorageModule],
  providers: [PerformanceService],
  exports: [PerformanceService],
})
export class PerformanceModule {}
