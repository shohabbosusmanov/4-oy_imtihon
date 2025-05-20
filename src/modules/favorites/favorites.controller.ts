import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { Request } from 'express';
import { JwtGuard } from 'src/common/guards/auth.guard';

@UseGuards(JwtGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  async getFavorites(@Req() req: Request) {
    return await this.favoritesService.getFavorites(req['user']['id']);
  }

  @Post()
  async addFavorites(@Body() body: string, @Req() req: Request) {
    return await this.favoritesService.addFavorites(req['user']['id'], body);
  }

  @Delete('/:movie_id')
  async deleteFavorites(
    @Req() req: Request,
    @Param('movie_id') movie_id: string,
  ) {
    return await this.favoritesService.deleteFavorites(
      req['user']['id'],
      movie_id,
    );
  }
}
