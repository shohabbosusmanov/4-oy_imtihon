import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import PrismaService from 'src/core/database/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async getFavorites(user_id) {
    try {
      const favorites = await this.prisma.favorite.findMany({
        where: { user_id },
        include: {
          movie: {
            select: {
              id: true,
              title: true,
              slug: true,
              poster_url: true,
              release_year: true,
              rating: true,
              subscription_type: true,
            },
          },
        },
      });

      return {
        data: {
          movies: favorites.map((favorite) => favorite.movie),
          total: favorites.length,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async addFavorites(user_id: string, body: string) {
    try {
      const favorite = await this.prisma.favorite.create({
        data: { user_id, movie_id: body['movie_id'] },
        select: {
          id: true,
          movie_id: true,
          movie: { select: { title: true } },
          created_at: true,
        },
      });

      return {
        message: "Kino sevimlilar ro'yxatiga qo'shildi",
        data: favorite,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async deleteFavorites(user_id: string, movie_id: string) {
    try {
      await this.prisma.favorite.delete({
        where: {
          user_id_movie_id: {
            user_id,
            movie_id,
          },
        },
      });

      return { message: "Kino sevimlilar ro'yxatidan o'chirildi" };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new BadRequestException('Favorite movie not found');
      }
      throw new InternalServerErrorException(error);
    }
  }
}
