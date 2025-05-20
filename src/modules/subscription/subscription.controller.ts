import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { JwtGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { PurchaseSubscriptionDto } from './dto/purchase-subscription.dto';
import { Request } from 'express';

@UseGuards(JwtGuard)
@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @UseGuards(RoleGuard)
  @SetMetadata('roles', ['superadmin'])
  @Post('create')
  async createSubscription(@Body() body: CreateSubscriptionDto) {
    return await this.subscriptionService.createSubscription(body);
  }

  @Get('plans')
  async getAll() {
    return await this.subscriptionService.getAll();
  }

  @Post('purchase')
  async purchase(@Body() body: PurchaseSubscriptionDto, @Req() req: Request) {
    const id = req['user']['id'];
    return await this.subscriptionService.purchase(body, id);
  }
}
