import { Subscription_type } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateMovieDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  release_year: number;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  duration_minutes: number;

  @IsNotEmpty()
  @Type(() => Number)
  rating: number;

  @IsOptional()
  @IsEnum(Subscription_type)
  subscription_type?: Subscription_type;

  @IsNotEmpty()
  category_ids: any;
}
