import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PointsTransaction } from './entities/points-transaction.entity';
import { Favorite } from './entities/favorite.entity';
import { RewardsService } from './rewards.service';
import { FavoritesController } from './favorites.controller';
import { UsersModule } from '../users/users.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [TypeOrmModule.forFeature([PointsTransaction, Favorite]), UsersModule, ProductsModule],
  controllers: [FavoritesController],
  providers: [RewardsService],
  exports: [RewardsService],
})
export class RewardsModule {}
