import { Quality } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMovieFileDto {
  @IsOptional()
  @IsString()
  movie_id: string;

  @IsOptional()
  @IsString()
  file_url: string;

  @IsNotEmpty()
  quality: Quality;

  @IsOptional()
  @IsString()
  language: string;
}
