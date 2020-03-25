import { NestFactory } from '@nestjs/core'
import { Logger } from '@nestjs/common'
import * as config from 'config'

import { AppModule } from './app.module'

async function bootstrap() {
  const server = config.get('server')
  const logger = new Logger('bootstrap')
  const port = process.env.PORT || server.port

  const app = await NestFactory.create(AppModule)
  await app.listen(port)
  logger.log(`Application listening on port ${port}`)
}
bootstrap()
