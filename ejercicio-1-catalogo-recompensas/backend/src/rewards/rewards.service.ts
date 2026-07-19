import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { RewardAction } from './entities/points-transaction.entity';
import { POINTS_RULES } from './points-rules';
import { applyPointsAward } from './rewards.util';
import { UsersService } from '../users/users.service';

@Injectable()
export class RewardsService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoritesRepository: Repository<Favorite>,
    private readonly dataSource: DataSource,
    private readonly usersService: UsersService,
  ) {}

  award(
    userId: number,
    action: RewardAction,
    points: number,
    referenceId: number | null = null,
  ): Promise<number> {
    return this.dataSource.transaction((manager) =>
      applyPointsAward(manager, userId, action, points, referenceId),
    );
  }

  async toggleFavorite(userId: number, productId: number) {
    const existing = await this.favoritesRepository.findOne({ where: { userId, productId } });

    if (existing) {
      await this.favoritesRepository.delete(existing.id);
      const user = await this.usersService.findById(userId);
      return { favorited: false, pointsBalance: user?.pointsBalance ?? 0 };
    }

    await this.favoritesRepository.insert({ userId, productId });
    const pointsBalance = await this.award(userId, RewardAction.FAVORITE, POINTS_RULES.FAVORITE, productId);
    return { favorited: true, pointsBalance };
  }
}
