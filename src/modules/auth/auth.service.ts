import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import PrismaService from 'src/core/database/prisma.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(data: RegisterDto) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const findUser = await tx.user.findUnique({
          where: { email: data.email },
        });

        if (findUser) throw new ConflictException('User already exists');

        const hashedPassword = await bcrypt.hash(data.password, 12);

        data.password = hashedPassword;

        const user = await tx.user.create({
          data,
          select: {
            id: true,
            username: true,
            role: true,
            created_at: true,
          },
        });

        const freePlan = await tx.subscription_plan.findFirst({
          where: {
            name: 'Free',
            is_active: true,
          },
          select: {
            id: true,
          },
        });

        if (!freePlan) {
          throw new InternalServerErrorException('Free plan not found');
        }

        await tx.user_subscription.create({
          data: {
            user_id: user.id,
            plan_id: freePlan.id,
            start_date: new Date(),
            end_date: new Date('9999-12-31T23:59:59.999Z'),
          },
        });

        return {
          message: "Ro'yxatdan muvaffaqiyatli o'tdingiz",
          data: user,
        };
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async login(data: LoginDto) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const findUser = await tx.user.findUnique({
          where: { email: data.email },
          select: {
            id: true,
            username: true,
            password: true,
            role: true,
            subscription: {
              select: {
                plan: {
                  select: {
                    name: true,
                    is_active: true,
                  },
                },
              },
            },
          },
        });

        if (!findUser) {
          throw new UnauthorizedException('Email or password incorrect');
        }

        const comparePassword = await bcrypt.compare(
          data.password,
          findUser.password,
        );

        if (!comparePassword) {
          throw new UnauthorizedException('Email or password incorrect');
        }

        const { password, ...result } = findUser;

        const access_token = await this.jwtService.signAsync({
          id: result.id,
          role: result.role,
        });

        return {
          access_token,
          data: {
            message: 'Muvaffaqiyatli kirildi',
            data: result,
          },
        };
      });
    } catch (error) {
      throw new ForbiddenException(error);
    }
  }
}
