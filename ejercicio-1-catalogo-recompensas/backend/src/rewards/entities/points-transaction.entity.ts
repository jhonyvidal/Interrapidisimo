import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum RewardAction {
  ADD_TO_CART = 'ADD_TO_CART',
  FAVORITE = 'FAVORITE',
  PURCHASE = 'PURCHASE',
}

// Ledger de puntos: cada fila es una accion que otorgo puntos. Permite
// auditar por que un usuario tiene el saldo que tiene y recalcularlo
// si el contador cacheado en User llegara a desincronizarse.
@Entity('points_transactions')
export class PointsTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Index()
  @Column()
  userId: number;

  @Column({ type: 'varchar' })
  action: RewardAction;

  @Column()
  points: number;

  @Column({ type: 'int', nullable: true })
  referenceId: number | null;

  @CreateDateColumn()
  createdAt: Date;
}
