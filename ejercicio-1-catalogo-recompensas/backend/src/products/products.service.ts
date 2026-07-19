import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { QueryProductsDto } from './dto/query-products.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async findPaginated(query: QueryProductsDto) {
    const { page, limit, category, search } = query;

    const qb = this.productsRepository.createQueryBuilder('product');

    if (category) {
      qb.andWhere('product.category = :category', { category });
    }
    if (search) {
      qb.andWhere('LOWER(product.name) LIKE LOWER(:search)', { search: `%${search}%` });
    }

    qb.orderBy('product.id', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Producto ${id} no encontrado`);
    }
    return product;
  }

  findCategories(): Promise<string[]> {
    return this.productsRepository
      .createQueryBuilder('product')
      .select('DISTINCT product.category', 'category')
      .orderBy('product.category', 'ASC')
      .getRawMany()
      .then((rows) => rows.map((r) => r.category));
  }
}
