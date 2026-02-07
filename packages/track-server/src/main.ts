import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ResponseInterceptor } from './common/respone/respone'
import { ValidationPipe } from '@nestjs/common'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const port = process.env.PORT ?? 3000
  app.useGlobalInterceptors(new ResponseInterceptor())
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    })
  )
  await app.listen(port)

  console.log(`🚀 Application is running on: http://localhost:${port}`)
}
bootstrap().catch((err) => {
  console.error(err)
})
