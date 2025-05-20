import { Subscription_type } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateMovieDto {
  @IsOptional()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  release_year: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  duration_minutes: number;

  @IsOptional()
  @Type(() => Number)
  rating: number;

  @IsOptional()
  @IsEnum(Subscription_type)
  subscription_type: Subscription_type;

  @IsOptional()
  @IsString()
  poster_url: string;

  @IsOptional()
  @IsString()
  category_ids: string[];
}
