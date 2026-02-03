import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ResponseInterceptor } from './common/respone/respone'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const port = process.env.PORT ?? 3000
  app.useGlobalInterceptors(new ResponseInterceptor())
  await app.listen(port)

  console.log(`🚀 Application is running on: http://localhost:${port}`)
}
bootstrap().catch((err) => {
  console.error(err)
})
