import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import PrismaService from 'src/core/database/prisma.service';
import { UpdateProfile } from './dto/update-profile.dto';
import fs from 'fs';
import path from 'path';

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async profile(id: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          full_name: true,
          username: true,
          email: true,
          role: true,
          phone_number: true,
          country: true,
          avatar_url: true,
          created_at: true,
        },
      });

      return { data: user };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async update(user_id: string, body: UpdateProfile) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const findUser = await tx.user.findUnique({
          where: { id: user_id },
        });
        if (!findUser) throw new NotFoundException('user not found');

        try {
          if (body.avatar_url && findUser.avatar_url != null) {
            fs.unlinkSync(
              path.join('uploads', 'profile-avatars', findUser.avatar_url),
            );
          }
        } catch (error) {}

        const { id, password, ...res } = findUser;
        const updatedUser = { ...res, ...body };

        const data = await tx.user.update({
          where: { id: user_id },
          data: updatedUser,
          select: {
            id: true,
            full_name: true,
            username: true,
            email: true,
            role: true,
            phone_number: true,
            country: true,
            avatar_url: true,
            updated_at: true,
          },
        });

        return { message: 'Profil muvaffaqiyatli yangilandi', data };
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
