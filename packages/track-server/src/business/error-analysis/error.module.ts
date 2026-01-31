import { Module } from '@nestjs/common'
import { StorageModule } from '../../storage/storage.module'
import { ErrorService } from './error.service'

@Module({
  imports: [StorageModule],
  providers: [ErrorService],
  exports: [ErrorService],
})
export class ErrorModule {}
