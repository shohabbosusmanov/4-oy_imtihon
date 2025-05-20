import {
  Body,
  Controller,
  Get,
  Put,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { Request } from 'express';
import { UpdateProfile } from './dto/update-profile.dto';
import { JwtGuard } from 'src/common/guards/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import path from 'path';
import { v4 as uuid } from 'uuid';

@UseGuards(JwtGuard)
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  async profile(@Req() req: Request) {
    const id: string = req['user']['id'];

    return await this.profileService.profile(id);
  }

  @Put()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/profile-avatars',
        filename: (req, file, cb) => {
          const extName = path.extname(file.originalname);
          const file_name = `${uuid()}${extName}`;

          const file_path = path.join('uploads', 'profile-avatars', file_name);

          req['file_name'] = file_name;
          req['file_path'] = file_path;
          cb(null, file_name);
        },
      }),
    }),
  )
  async update(@Body() body: UpdateProfile, @Req() req: Request) {
    const id: string = req['user']['id'];

    const file_name: string = req['file_name'];

    if (file_name) {
      body.avatar_url = file_name;
    }

    return await this.profileService.update(id, body);
  }
}
