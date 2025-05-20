import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import PrismaService from 'src/core/database/prisma.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { CreateCategoryDto } from './dto/create-category.sto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import fs from 'fs';
import path from 'path';
import { CreateMovieFileDto } from './dto/create-movie-files.dto';
import slugify from 'slugify';
import ShortUniqueId from 'short-unique-id';

@Injectable()
export class AdminService {
  private uid = new ShortUniqueId({ length: 8 });

  constructor(private readonly prisma: PrismaService) {}

  generateSlug(name: string) {
    return slugify(name, { strict: true, lower: true }) + '-' + this.uid.rnd();
  }

  async createAdmin(id: string) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });

      if (!user) throw new BadRequestException('User not found');

      await this.prisma.user.update({ where: { id }, data: { role: 'admin' } });

      return { message: 'admin yaratildi' };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async deleteAdmin(id: string) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });

      if (!user) throw new BadRequestException('User not found');

      if (user.role != 'admin')
        throw new BadRequestException('Bu user admin emas');

      await this.prisma.user.update({ where: { id }, data: { role: 'user' } });

      return { message: "admin o'chirildi" };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getMovies() {
    try {
      const movies = await this.prisma.movie.findMany();

      return { data: { movies, total: movies.length } };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createCategory(body: CreateCategoryDto) {
    try {
      const category = await this.prisma.category.create({ data: body });

      return { message: 'Category yaratildi', data: category };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createMovie(body: CreateMovieDto, file_name: string, user_id: string) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        let { category_ids, ...movieData } = body;

        if (!category_ids || category_ids.length == 0) {
          throw new BadRequestException('Category ids not found');
        }

        const movie = await tx.movie.create({
          data: {
            ...movieData,
            slug: this.generateSlug(movieData.title),
            poster_url: file_name,
            created_by: user_id,
            movie_categories: {
              create: category_ids?.map((category_id) => ({
                category: { connect: { id: category_id } },
              })),
            },
          },
          select: {
            id: true,
            title: true,
            created_at: true,
          },
        });

        return { message: "Yangi kino muvaffaqiyatli qo'shildi", data: movie };
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateMovie(
    body: UpdateMovieDto,
    file_name: string,
    user_id: string,
    movie_id: string,
  ) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const findMovie = await tx.movie.findUnique({
          where: {
            id: movie_id,
          },
        });

        if (!findMovie) throw new BadRequestException('Movie not found');

        if (file_name) {
          body.poster_url = file_name;
        }

        try {
          if (body.poster_url && findMovie.poster_url != null) {
            fs.unlinkSync(
              path.join('uploads', 'posters', findMovie.poster_url),
            );
          }
        } catch (error) {}

        let { category_ids, ...movieData } = body;
        let movie: any;

        if (category_ids && category_ids.length > 0) {
          movie = await tx.movie.update({
            where: { id: movie_id },
            data: {
              ...movieData,
              created_by: user_id,
              movie_categories: {
                create: category_ids?.map((category_id) => ({
                  category: { connect: { id: category_id } },
                })),
              },
            },
            select: {
              id: true,
              title: true,
              created_at: true,
            },
          });
        } else {
          movie = await tx.movie.update({
            where: { id: movie_id },
            data: {
              ...movieData,
              created_by: user_id,
            },
            select: {
              id: true,
              title: true,
              created_at: true,
            },
          });
        }

        return { message: 'Kino muvaffaqiyatli yangilandi', data: movie };
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async addMovieFiles(file_size: number, body: CreateMovieFileDto) {
    try {
      const movieFile = await this.prisma.movie_file.create({
        data: { ...body, size_MB: file_size },
      });

      return {
        message: 'Kino fayli muvaffaqiyatli yuklandi',
        data: movieFile,
      };
    } catch (error) {
      console.log(error);

      throw new InternalServerErrorException(error);
    }
  }

  async deleteMovie(movie_id: string) {
    try {
      const findMovie = await this.prisma.movie.findUnique({
        where: {
          id: movie_id,
        },
      });

      if (!findMovie) throw new BadRequestException('Movie not found');

      try {
        if (findMovie.poster_url != null) {
          fs.unlinkSync(path.join('uploads', 'posters', findMovie.poster_url));
        }
      } catch (error) {}

      await this.prisma.movie.delete({ where: { id: movie_id } });

      return { message: "Kino o\'chirildi" };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
