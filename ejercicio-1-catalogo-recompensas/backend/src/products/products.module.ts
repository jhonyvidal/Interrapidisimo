import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductsSeedService } from './products-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  providers: [ProductsSeedService],
  exports: [TypeOrmModule],
})
export class ProductsModule {}
