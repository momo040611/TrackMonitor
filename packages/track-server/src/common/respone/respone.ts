import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { map, Observable } from 'rxjs'

// 统一响应格式的泛型接口
interface Data<T> {
  status: number
  data: T
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Data<T>> {
    return next.handle().pipe(
      map((data: T) => {
        return {
          status: 0,
          data: data,
          code: 200,
        }
      })
    )
  }
}
