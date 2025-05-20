import { Payment_method } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsString,
} from 'class-validator';

export class PurchaseSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  plan_id: string;

  @IsEnum(Payment_method)
  payment_method: Payment_method;

  @IsBoolean()
  auto_renew: boolean = false;

  @IsObject()
  payment_details: {};
}
