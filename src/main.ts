import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envs } from './config';

async function bootstrap() {
  const logger = new Logger('MSOrders');
  const app = await NestFactory.create(AppModule);

  await app.listen(envs.PORT);
  logger.log(`Microservice is running on port ${envs.PORT}`);
}

void bootstrap();
