import { Injectable, Logger } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { envs } from 'src/config';

@Injectable()
export class PrismaService extends PrismaClient {
  private readonly logger = new Logger('PrismaService');
  constructor() {
    const connectionString = envs.DATABASE_URL;
    super({
      adapter: new PrismaPg({ connectionString }),
    });

    this.logger.log('Database connected');
  }
}
