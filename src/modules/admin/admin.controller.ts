import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  SetMetadata,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { RoleGuard } from 'src/common/guards/role.guard';
import { JwtGuard } from 'src/common/guards/auth.guard';
import { CreateMovieDto } from './dto/create-movie.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { CreateCategoryDto } from './dto/create-category.sto';
import { diskStorage } from 'multer';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { CreateMovieFileDto } from './dto/create-movie-files.dto';

@UseGuards(JwtGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @UseGuards(RoleGuard)
  @SetMetadata('roles', ['superadmin'])
  @Post('create-admin')
  async createAdmin(@Body() body: string) {
    return await this.adminService.createAdmin(body['id']);
  }

  @UseGuards(RoleGuard)
  @SetMetadata('roles', ['admin'])
  @Post()
  async deleteAdmin(@Body() body: string) {
    return await this.adminService.deleteAdmin(body['id']);
  }

  @UseGuards(RoleGuard)
  @SetMetadata('roles', ['admin'])
  @Get('movies')
  async getMovies() {
    return await this.adminService.getMovies();
  }

  @UseGuards(RoleGuard)
  @SetMetadata('roles', ['admin'])
  @Post('create-category')
  async createCategory(@Body() body: CreateCategoryDto) {
    return await this.adminService.createCategory(body);
  }

  @UseGuards(RoleGuard)
  @SetMetadata('roles', ['admin'])
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/posters',
        filename: (req, file, cb) => {
          const extName = path.extname(file.originalname);
          const file_name = `${uuid()}${extName}`;
          const file_path = path.join('uploads', 'posters', file_name);

          req['file_name'] = file_name;
          req['file_path'] = file_path;
          cb(null, file_name);
        },
      }),
    }),
  )
  @Post('movies')
  async createMovie(@Body() body: CreateMovieDto, @Req() req: Request) {
    try {
      if (typeof body.category_ids == 'string') {
        body.category_ids = JSON.parse(body.category_ids);
      }
    } catch (error) {
      throw new BadRequestException('invalid category_ids');
    }

    const file_name: string = req['file_name'];

    const user_id: string = req['user']['id'];

    if (typeof body.rating == 'string') {
      body.rating = parseFloat(body.rating);
    }

    return await this.adminService.createMovie(body, file_name, user_id);
  }

  @UseGuards(RoleGuard)
  @SetMetadata('roles', ['admin'])
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/posters',
        filename: (req, file, cb) => {
          const extName = path.extname(file.originalname);
          const file_name = `${uuid()}${extName}`;
          const file_path = path.join('uploads', 'posters', file_name);

          req['file_name'] = file_name;
          req['file_path'] = file_path;
          cb(null, file_name);
        },
      }),
    }),
  )
  @Put('movies/:movie_id')
  async updateMovie(
    @Body() body: UpdateMovieDto,
    @Req() req: Request,
    @Param('movie_id') movie_id: string,
  ) {
    try {
      if (typeof body.category_ids == 'string') {
        body.category_ids = JSON.parse(body.category_ids);
      }
    } catch (error) {
      throw new BadRequestException('invalid category_ids');
    }

    const file_name: string = req['file_name'];

    const user_id: string = req['user']['id'];

    if (typeof body.rating == 'string') {
      body.rating = parseFloat(body.rating);
    }

    return await this.adminService.updateMovie(
      body,
      file_name,
      user_id,
      movie_id,
    );
  }

  @UseGuards(RoleGuard)
  @SetMetadata('roles', ['admin'])
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/videos',
        filename: (req, file, cb) => {
          const extName = path.extname(file.originalname);
          const file_name = `${uuid()}${extName}`;
          const file_path = path.join('uploads', 'videos', file_name);

          req['file_name'] = file_name;
          req['file_path'] = file_path;
          cb(null, file_name);
        },
      }),
    }),
  )
  @Post('movies/:movie_id/files')
  async addMovieFiles(
    @Body() body: CreateMovieFileDto,
    @Req() req: Request,
    @Param('movie_id') movie_id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const file_name: string = req['file_name'];
    body.file_url = file_name;
    body.movie_id = movie_id;

    const file_size = Number((file.size / 1024 / 1024).toFixed(2));

    return await this.adminService.addMovieFiles(file_size, body);
  }

  @UseGuards(RoleGuard)
  @SetMetadata('roles', ['admin'])
  @Delete('movies/:movie_id')
  async deleteMovie(@Param('movie_id') movie_id: string) {
    return await this.adminService.deleteMovie(movie_id);
  }
}
