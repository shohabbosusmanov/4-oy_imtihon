import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import PrismaService from 'src/core/database/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { PurchaseSubscriptionDto } from './dto/purchase-subscription.dto';

@Injectable()
export class SubscriptionService {
  constructor(private readonly prisma: PrismaService) {}

  async createSubscription(body: CreateSubscriptionDto) {
    try {
      const subscription = await this.prisma.subscription_plan.create({
        data: body,
      });

      return { message: 'Obuna rejasi yaratildi', data: subscription };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getAll() {
    try {
      const data = await this.prisma.subscription_plan.findMany();
      return { data };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async purchase(body: PurchaseSubscriptionDto, id: string) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const plan = await tx.subscription_plan.findUnique({
          where: { id: body.plan_id },
        });

        if (!plan) {
          throw new NotFoundException('Subscription plan not found');
        }

        const user_subscription = await tx.user_subscription.create({
          data: {
            user_id: id,
            plan_id: body.plan_id,
            start_date: new Date(),
            end_date: new Date(Date.now() + plan.duration_days * 86400000),
            auto_renew: body.auto_renew,
          },
        });

        await tx.payment.create({
          data: {
            user_subscription_id: user_subscription.id,
            amount: plan.price,
            payment_method: body.payment_method,
            payment_details: body.payment_details,
            status: 'completed',
          },
        });

        const subscription = await tx.user_subscription.findUnique({
          where: { id: user_subscription.id },
          select: {
            id: true,
            plan: {
              select: {
                id: true,
                name: true,
              },
            },
            start_date: true,
            end_date: true,
            auto_renew: true,
            payments: {
              select: {
                id: true,
                amount: true,
                status: true,
                external_transaction_id: true,
                payment_method: true,
              },
            },
          },
        });

        return {
          message: 'Obuna muvaffaqiyatli sotib olindi',
          data: subscription,
        };
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
