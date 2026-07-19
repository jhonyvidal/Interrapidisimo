import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PointsTransaction } from './entities/points-transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PointsTransaction])],
  exports: [TypeOrmModule],
})
export class RewardsModule {}
