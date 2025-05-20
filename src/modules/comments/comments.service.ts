import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import PrismaService from 'src/core/database/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async addComment(user_id: string, movie_id: string, body: CreateCommentDto) {
    try {
      const comment = await this.prisma.review.create({
        data: { user_id, movie_id, ...body },
        select: {
          id: true,
          user: {
            select: {
              id: true,
              username: true,
            },
          },
          movie_id: true,
          rating: true,
          comment: true,
          created_at: true,
        },
      });

      return { message: "Sharh muvaffaqiyatli qo'shildi", data: comment };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async deleteComment(review_id: string) {
    try {
      await this.prisma.review.delete({ where: { id: review_id } });

      return { message: "Sharh muvaffaqiyatli o'chirildi" };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Review not found');
      }
      throw new InternalServerErrorException(error);
    }
  }
}
