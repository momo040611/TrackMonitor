import { Injectable } from '@nestjs/common'
import { DatabaseService } from './database/database.service'
import { EventDto } from '../dto/event'

@Injectable()
export class StorageService {
  constructor(private readonly databaseService: DatabaseService) {}

  async saveEvent(event: EventDto): Promise<number> {
    return this.databaseService.saveEvent(event)
  }

  async getEvents(params: any): Promise<any[]> {
    return this.databaseService.getEvents(params)
  }
}
