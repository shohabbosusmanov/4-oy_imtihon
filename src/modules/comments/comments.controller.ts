import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Request } from 'express';
import { JwtGuard } from 'src/common/guards/auth.guard';

@UseGuards(JwtGuard)
@Controller('movies')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post('/:movie_id/reviews')
  async addComment(
    @Param('movie_id') movie_id: string,
    @Body() body: CreateCommentDto,
    @Req() req: Request,
  ) {
    const user_id: string = req['user']['id'];

    return await this.commentsService.addComment(user_id, movie_id, body);
  }

  @Delete('/:movie_id/reviews/:review_id')
  async deleteComment(@Param('review_id') review_id: string) {
    return await this.commentsService.deleteComment(review_id);
  }
}
