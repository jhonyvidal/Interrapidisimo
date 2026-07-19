import { Controller, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { ProductsService } from '../products/products.service';
import { RewardsService } from './rewards.service';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(
    private readonly rewardsService: RewardsService,
    private readonly productsService: ProductsService,
  ) {}

  @Post(':id/favorite')
  async toggleFavorite(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    await this.productsService.findOne(id); // 404 si el producto no existe
    return this.rewardsService.toggleFavorite(user.id, id);
  }
}
