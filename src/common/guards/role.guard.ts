import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    const userRole: Role = user.role;

    const handler = context.getHandler();
    const roles: Role[] = this.reflector.get('roles', handler);

    if (roles.includes(userRole)) {
      return true;
    }

    return false;
  }
}
