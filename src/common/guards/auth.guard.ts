import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const token = request.cookies?.auth_token;

    if (!token) {
      throw new UnauthorizedException('token invalid');
    }
    try {
      const data = await this.jwtService.verifyAsync(token);

      request.user = data;

      return true;
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }
}
