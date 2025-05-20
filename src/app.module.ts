import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProfileModule } from './modules/profile/profile.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { MoviesModule } from './modules/movies/movies.module';
import { AdminModule } from './modules/admin/admin.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { CommentsModule } from './modules/comments/comments.module';

@Module({
  imports: [CoreModule, AuthModule, ProfileModule, SubscriptionModule, MoviesModule, AdminModule, FavoritesModule, CommentsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
