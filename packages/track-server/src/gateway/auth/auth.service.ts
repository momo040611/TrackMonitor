import { Injectable } from '@nestjs/common'

@Injectable()
export class AuthService {
  validateToken(token: string): boolean {
    // 验证 token 逻辑
    return true
  }

  generateToken(payload: any): string {
    // 生成 token 逻辑
    return 'token'
  }
}
