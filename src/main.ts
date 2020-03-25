import { NestFactory } from '@nestjs/core'
import { Logger } from '@nestjs/common'
import * as config from 'config'

import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const logger = new Logger('bootstrap')

  const server = config.get('server')
  const port = process.env.PORT || server.port

  if (process.env.NODE_ENV === 'development') {
    app.enableCors()
  } else {
    const origin = server.origin

    app.enableCors({
      origin,
    })
    logger.log(`Accepting request from origin ${origin}`)
  }

  await app.listen(port)
  logger.log(`Application listening on port ${port}`)
}
bootstrap()
