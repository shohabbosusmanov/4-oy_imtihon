import { Body, Controller, Get, HttpCode, Post, Res } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: RegisterDto) {
    return await this.authService.register(body);
  }

  @HttpCode(200)
  @Post('login')
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { access_token, data } = await this.authService.login(body);
    response.cookie('auth_token', access_token, {
      httpOnly: true,
      secure: true,
      maxAge: 1.1 * 3600 * 1000,
    });

    return data;
  }

  @Get('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('auth_token');
    return {
      message: 'Muvaffaqiyatli tizimdan chiqildi',
    };
  }
}
