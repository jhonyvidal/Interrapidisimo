import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';

const SEED_PRODUCTS: Omit<Product, 'id'>[] = [
  { name: 'Audífonos Bluetooth', price: 129900, category: 'Tecnología', image: 'https://picsum.photos/seed/audifonos/400/300', stock: 25 },
  { name: 'Teclado mecánico', price: 219900, category: 'Tecnología', image: 'https://picsum.photos/seed/teclado/400/300', stock: 15 },
  { name: 'Mouse inalámbrico', price: 79900, category: 'Tecnología', image: 'https://picsum.photos/seed/mouse/400/300', stock: 40 },
  { name: 'Monitor 27" 144Hz', price: 899900, category: 'Tecnología', image: 'https://picsum.photos/seed/monitor/400/300', stock: 8 },
  { name: 'Cargador USB-C 65W', price: 89900, category: 'Tecnología', image: 'https://picsum.photos/seed/cargador/400/300', stock: 30 },
  { name: 'Cafetera eléctrica', price: 189900, category: 'Hogar', image: 'https://picsum.photos/seed/cafetera/400/300', stock: 12 },
  { name: 'Set de sábanas', price: 149900, category: 'Hogar', image: 'https://picsum.photos/seed/sabanas/400/300', stock: 20 },
  { name: 'Lámpara de escritorio', price: 69900, category: 'Hogar', image: 'https://picsum.photos/seed/lampara/400/300', stock: 18 },
  { name: 'Aspiradora portátil', price: 259900, category: 'Hogar', image: 'https://picsum.photos/seed/aspiradora/400/300', stock: 10 },
  { name: 'Chaqueta impermeable', price: 219900, category: 'Ropa', image: 'https://picsum.photos/seed/chaqueta/400/300', stock: 22 },
  { name: 'Zapatillas running', price: 259900, category: 'Ropa', image: 'https://picsum.photos/seed/zapatillas/400/300', stock: 16 },
  { name: 'Camiseta técnica', price: 59900, category: 'Ropa', image: 'https://picsum.photos/seed/camiseta/400/300', stock: 50 },
  { name: 'Gorra deportiva', price: 39900, category: 'Ropa', image: 'https://picsum.photos/seed/gorra/400/300', stock: 35 },
  { name: 'Balón de fútbol', price: 99900, category: 'Deportes', image: 'https://picsum.photos/seed/balon/400/300', stock: 28 },
  { name: 'Mancuernas ajustables', price: 349900, category: 'Deportes', image: 'https://picsum.photos/seed/mancuernas/400/300', stock: 6 },
  { name: 'Yoga mat', price: 89900, category: 'Deportes', image: 'https://picsum.photos/seed/yogamat/400/300', stock: 24 },
];

@Injectable()
export class ProductsSeedService implements OnModuleInit {
  private readonly logger = new Logger(ProductsSeedService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async onModuleInit() {
    const count = await this.productsRepository.count();
    if (count > 0) {
      return;
    }
    await this.productsRepository.insert(SEED_PRODUCTS);
    this.logger.log(`Seed: ${SEED_PRODUCTS.length} productos insertados`);
  }
}
