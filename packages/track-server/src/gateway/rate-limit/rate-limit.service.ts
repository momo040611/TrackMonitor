import { Injectable } from '@nestjs/common'

@Injectable()
export class RateLimitService {
  checkLimit(ip: string): boolean {
    // 限流逻辑
    return true
  }
}
