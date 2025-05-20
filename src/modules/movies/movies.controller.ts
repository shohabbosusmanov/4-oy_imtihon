import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { JwtGuard } from 'src/common/guards/auth.guard';

@UseGuards(JwtGuard)
@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get()
  async getMovies(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('category') category: string,
    @Query('search') search: string,
    @Query('subscription_type') subscriptionType: string,
  ) {
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    return await this.moviesService.getMovies(
      pageNumber,
      limitNumber,
      category,
      search,
      subscriptionType,
    );
  }

  @Get('/:slug')
  async getMoviesBySlug(@Param('slug') slug: string) {
    return await this.moviesService.getMoviesBySlug(slug);
  }
}
