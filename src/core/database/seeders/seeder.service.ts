import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import PrismaService from '../prisma.service';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcrypt';

@Injectable()
export class SeederService implements OnModuleInit {
  private readonly logger = new Logger(SeederService.name, { timestamp: true });
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async seedAll() {
    await this.seedFreePlan();
    await this.seedUsers();
  }

  async seedFreePlan() {
    const freePlan = await this.prisma.subscription_plan.findFirst({
      where: { name: 'Free', duration_days: 0 },
    });

    if (freePlan) {
      return true;
    }
    await this.prisma.subscription_plan.create({
      data: {
        name: 'Free',
        price: 0.0,
        duration_days: 0,
        features: ['SD sifatli kinolar', 'Reklama bilan'],
      },
      select: { id: true },
    });
    return true;
  }

  async seedUsers() {
    const username = this.configService.get('SUPER_ADMIN_USERNAME');
    const email = this.configService.get('SUPER_ADMIN_EMAIL');
    let password = this.configService.get('SUPER_ADMIN_PASSWORD');

    const hashedPassword = await bcrypt.hash(password, 12);

    const findSuperAdmin = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!findSuperAdmin) {
      await this.prisma.user.create({
        data: {
          full_name: 'super admin',
          username,
          email,
          password: hashedPassword,
          role: 'superadmin',
        },
      });
    }
    this.logger.log('Users seeders completed');

    return true;
  }

  async onModuleInit() {
    try {
      await this.seedAll();
    } catch (error) {
      this.logger.error(error);
    }
  }
}
