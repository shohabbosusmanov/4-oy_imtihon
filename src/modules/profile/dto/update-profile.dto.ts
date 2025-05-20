import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateProfile {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  full_name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  username?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  email?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  avatar_url?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  phone_number?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  country?: string;
}
