import { Injectable } from '@nestjs/common'
import { StorageService } from 'src/storage/storage.service'
import { EventDto } from 'src/common/dto/event'

@Injectable()
export class ErrorService {
  constructor(private readonly storageService: StorageService) {}

  async reportErrorEvent(event: EventDto) {
    await this.storageService.saveEvent(event)
  }

  async getErrors({ time, limit }: { time: number; limit: number }) {
    return await this.storageService.getEvents({ type: 'error', time, limit })
  }
}
