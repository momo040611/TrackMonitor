import { Injectable } from '@nestjs/common'
import { StorageService } from '../../storage/storage.service'
import { EventDto } from '../../common/dto/event'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UserActivityStatsEntity } from '../../storage/database/entities/user-activity-stats.entity'

@Injectable()
export class EventAnalysisService {
  constructor(
    private readonly storageService: StorageService,
    @InjectRepository(UserActivityStatsEntity)
    private readonly statsRepository: Repository<UserActivityStatsEntity>
  ) {}

  async processUserBehavior(event: EventDto) {
    // 1. Save raw event
    await this.storageService.saveEvent(event)

    // 2. Update user activity stats
    if (event.userId) {
      await this.updateUserActivity(event.userId)
    }
  }

  private async updateUserActivity(userId: number) {
    const today = new Date().toISOString().split('T')[0]

    let stats = await this.statsRepository.findOne({
      where: { userId, date: today },
    })

    if (stats) {
      stats.eventCount += 1
      await this.statsRepository.save(stats)
    } else {
      stats = this.statsRepository.create({
        userId,
        date: today,
        eventCount: 1,
      })
      await this.statsRepository.save(stats)
    }
  }

  async getUserBehaviors(userId: number) {
    return await this.storageService.getEvents({ userId })
  }

  async getUserStats(userId: number) {
    return await this.statsRepository.find({
      where: { userId },
      order: { date: 'DESC' },
    })
  }
}
