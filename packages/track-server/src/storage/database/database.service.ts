import { Injectable, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, MoreThanOrEqual } from 'typeorm'
import { EventEntity } from './entities/event.entity'
import { PerformanceEvent } from './performance.entity'
import ms from 'ms'

@Injectable()
export class DatabaseService {
  constructor(
    @InjectRepository(EventEntity)
    private readonly eventRepo: Repository<EventEntity>,
    @InjectRepository(PerformanceEvent)
    private readonly performanceRepo: Repository<PerformanceEvent>
  ) {}

  async saveEvent(event: any): Promise<number> {
    // 使用 create 创建实体，处理默认值
    const newEvent = this.eventRepo.create({
      type: event.type,
      data: event.data,
      url: event.url || '',
      priority: event.priority || 0, // 简单处理优先级，如果是枚举可做映射
      userId: event.userId || 0,
      timestamp: Date.now(),
    })

    const saved = await this.eventRepo.save(newEvent)
    return saved.id
  }

  async getEvents(params: any): Promise<EventEntity[]> {
    const { type, time, limit } = params
    const whereCondition: any = {}

    if (type && type !== 'all') {
      whereCondition.type = type
    }

    // 处理时间筛选 (例如 '1h', '30m')
    if (time) {
      const timeMs = typeof time === 'string' ? ms(time) : time
      if (timeMs) {
        whereCondition.createdAt = MoreThanOrEqual(new Date(Date.now() - timeMs))
      }
    }

    return this.eventRepo.find({
      where: whereCondition,
      order: { createdAt: 'DESC' },
      take: limit || 20,
    })
  }

  async savePerformanceEvent(data: any): Promise<PerformanceEvent> {
    const perfEvent = this.performanceRepo.create({
      type: data.type,
      name: data.name,
      value: data.value,
      unit: data.unit,
      timestamp: data.time || Date.now(),
      userAgent: data.userAgent,
      detail: data.detail,
      pageUrl: data.pageInfo?.url,
      pageTitle: data.pageInfo?.title,
    })

    return await this.performanceRepo.save(perfEvent)
  }

  //  获取性能趋势分析 (聚合查询)

  async getPerformanceAnalysis(type: string, name: string, startTime: number, endTime: number) {
    const query = this.performanceRepo
      .createQueryBuilder('event')
      // 按小时聚合数据：格式化时间戳为 'YYYY-MM-DD HH:00:00'
      .select("DATE_FORMAT(FROM_UNIXTIME(event.timestamp / 1000), '%Y-%m-%d %H:00:00')", 'time')
      .addSelect('AVG(event.value)', 'avgValue')
      .addSelect('COUNT(event.id)', 'count')
      .where('event.timestamp BETWEEN :startTime AND :endTime', { startTime, endTime })

    // 动态添加过滤条件
    if (type) {
      query.andWhere('event.type = :type', { type })
    }
    if (name) {
      query.andWhere('event.name = :name', { name })
    }

    // 分组排序
    query.groupBy('time').orderBy('time', 'ASC')

    const rawData = await query.getRawMany()

    // 格式化返回给前端
    return rawData.map((item) => ({
      time: item.time,
      value: parseFloat(item.avgValue).toFixed(2), // 保留两位小数
      count: parseInt(item.count, 10),
    }))
  }
}
