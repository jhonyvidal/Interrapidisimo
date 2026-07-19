import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('cart/items')
  addItem(@CurrentUser() user: User, @Body() dto: AddCartItemDto) {
    return this.cartService.addItem(user.id, dto);
  }

  @Delete('cart/items/:productId')
  removeItem(@CurrentUser() user: User, @Param('productId', ParseIntPipe) productId: number) {
    return this.cartService.removeItem(user.id, productId);
  }

  @Get('cart')
  getCart(@CurrentUser() user: User) {
    return this.cartService.getCart(user.id);
  }

  @Post('checkout')
  @HttpCode(HttpStatus.OK)
  checkout(@CurrentUser() user: User) {
    return this.cartService.checkout(user.id);
  }
}
