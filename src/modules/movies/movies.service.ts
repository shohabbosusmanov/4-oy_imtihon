import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Subscription_type } from '@prisma/client';
import { startWith } from 'rxjs';
import PrismaService from 'src/core/database/prisma.service';

@Injectable()
export class MoviesService {
  constructor(private readonly prisma: PrismaService) {}

  async getMovies(
    page: number,
    limit: number,
    category: string,
    search: string,
    subscriptionType: string,
  ) {
    try {
      const skip = (page - 1) * limit;

      const movies = await this.prisma.movie.findMany({
        where: {
          title: {
            contains: search,
            mode: 'insensitive',
          },
          movie_categories: {
            some: {
              category: {
                is: {
                  name: {
                    equals: category,
                    mode: 'insensitive',
                  },
                },
              },
            },
          },
          subscription_type: subscriptionType as Subscription_type,
        },
        skip,
        take: limit,
        include: {
          movie_categories: {
            include: {
              category: {
                select: { name: true },
              },
            },
          },
        },
      });

      const total = await this.prisma.movie.count({
        where: {
          title: {
            contains: search,
            mode: 'insensitive',
          },
          movie_categories: {
            some: {
              category: {
                is: {
                  name: {
                    equals: category,
                    mode: 'insensitive',
                  },
                },
              },
            },
          },
          subscription_type: subscriptionType as Subscription_type,
        },
      });

      const arrMovies = movies.map((movie) => ({
        ...movie,
        categories: movie.movie_categories.map((c) => c.category.name),
      }));

      const pages = Math.ceil(total / limit);

      return {
        data: {
          movies: arrMovies,
          pagination: {
            total,
            page,
            limit,
            pages,
          },
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getMoviesBySlug(slug: string) {
    try {
      const movie = await this.prisma.movie.findFirst({
        where: { slug: { startsWith: slug } },
        include: {
          movie_categories: {
            select: {
              category: {
                select: { name: true },
              },
            },
          },
          files: {
            select: {
              quality: true,
              language: true,
              size_MB: true,
            },
          },
          favorites: true,
        },
      });

      if (!movie) {
        throw new NotFoundException('Movie not found');
      }

      await this.prisma.movie.update({
        where: { id: movie.id },
        data: { view_count: movie.view_count + 1 },
      });

      const review = await this.prisma.review.aggregate({
        where: {
          movie_id: movie.id,
        },
        _avg: {
          rating: true,
        },
        _count: true,
      });

      const is_favorite = movie.favorites.length > 0 ? true : false;

      return {
        data: {
          id: movie.id,
          title: movie.title,
          slug: movie.slug,
          description: movie.description,
          release_year: movie.release_year,
          duration_minutes: movie.duration_minutes,
          poster_url: movie.poster_url,
          rating: movie.rating,
          subscription_type: movie.subscription_type,
          view_count: movie.view_count,
          is_favorite,
          categories: movie.movie_categories.map((c) => c.category.name),
          files: movie.files,
          reviews: {
            average_rating: review._avg.rating,
            count: review._count,
          },
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
