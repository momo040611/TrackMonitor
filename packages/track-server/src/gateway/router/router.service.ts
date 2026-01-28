import { Injectable } from '@nestjs/common'

@Injectable()
export class RouterService {
  routeRequest(request: any): string {
    // 路由逻辑
    // 根据请求内容判断路由到哪个处理层
    if (request.type === 'event') {
      return 'processing'
    } else if (request.type === 'report') {
      return 'business'
    }
    return 'processing'
  }
}
