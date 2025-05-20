import {
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

export default class PrismaService
  extends PrismaClient
  implements OnModuleInit
{
  private readonly logger = new Logger(PrismaService.name, { timestamp: true });
  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log(`Prisma connected`);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('prisma connection failed');
    }
  }
}
