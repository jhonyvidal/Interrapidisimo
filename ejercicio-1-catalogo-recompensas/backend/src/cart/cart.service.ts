import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CartItem } from './entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { ProductsService } from '../products/products.service';
import { RewardsService } from '../rewards/rewards.service';
import { RewardAction } from '../rewards/entities/points-transaction.entity';
import { POINTS_RULES, calculatePurchasePoints } from '../rewards/points-rules';
import { applyPointsAward } from '../rewards/rewards.util';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartRepository: Repository<CartItem>,
    private readonly productsService: ProductsService,
    private readonly rewardsService: RewardsService,
    private readonly dataSource: DataSource,
  ) {}

  async addItem(userId: number, dto: AddCartItemDto) {
    const product = await this.productsService.findOne(dto.productId);
    if (product.stock < dto.quantity) {
      throw new BadRequestException(`Stock insuficiente para "${product.name}"`);
    }

    const existing = await this.cartRepository.findOne({ where: { userId, productId: product.id } });
    if (existing) {
      existing.quantity += dto.quantity;
      await this.cartRepository.save(existing);
    } else {
      await this.cartRepository.save(
        this.cartRepository.create({ userId, productId: product.id, quantity: dto.quantity }),
      );
    }

    const pointsBalance = await this.rewardsService.award(
      userId,
      RewardAction.ADD_TO_CART,
      POINTS_RULES.ADD_TO_CART,
      product.id,
    );

    return { ...(await this.getCart(userId)), pointsBalance };
  }

  async removeItem(userId: number, productId: number) {
    await this.cartRepository.delete({ userId, productId });
    return this.getCart(userId);
  }

  async getCart(userId: number) {
    const items = await this.cartRepository.find({ where: { userId } });
    const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    return { items, total };
  }

  async checkout(userId: number) {
    const items = await this.cartRepository.find({ where: { userId } });
    if (items.length === 0) {
      throw new BadRequestException('El carrito esta vacio');
    }

    return this.dataSource.transaction(async (manager) => {
      const productRepo = manager.getRepository(Product);

      let total = 0;
      for (const item of items) {
        const product = await productRepo.findOneOrFail({ where: { id: item.productId } });
        if (product.stock < item.quantity) {
          throw new ConflictException(`Stock insuficiente para "${product.name}"`);
        }
        total += product.price * item.quantity;
      }

      for (const item of items) {
        await productRepo.decrement({ id: item.productId }, 'stock', item.quantity);
      }
      await manager.getRepository(CartItem).delete({ userId });

      const pointsEarned = calculatePurchasePoints(total);
      const pointsBalance = await applyPointsAward(manager, userId, RewardAction.PURCHASE, pointsEarned, null);

      return { total, pointsEarned, pointsBalance };
    });
  }
}
