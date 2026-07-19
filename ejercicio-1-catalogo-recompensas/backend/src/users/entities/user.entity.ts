import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  // Saldo cacheado para lecturas rapidas; la fuente de verdad es el ledger
  // en PointsTransaction, este campo se recalcula/actualiza en cada award.
  @Column({ default: 0 })
  pointsBalance: number;

  @CreateDateColumn()
  createdAt: Date;
}
