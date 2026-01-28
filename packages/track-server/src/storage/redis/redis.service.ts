import { Injectable } from '@nestjs/common'

@Injectable()
export class RedisService {
  async set(key: string, value: any, ttl?: number): Promise<void> {
    // Redis 设置逻辑
  }

  async get(key: string): Promise<any> {
    // Redis 获取逻辑
    return null
  }
}
