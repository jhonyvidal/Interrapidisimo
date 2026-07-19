import { EntityManager } from 'typeorm';
import { PointsTransaction, RewardAction } from './entities/points-transaction.entity';
import { User } from '../users/entities/user.entity';

// Escribe el ledger y actualiza el saldo cacheado dentro del EntityManager
// recibido, para poder participar de una transaccion mas amplia (ej. el
// checkout, donde el award debe ser atomico junto con el descuento de stock).
export async function applyPointsAward(
  manager: EntityManager,
  userId: number,
  action: RewardAction,
  points: number,
  referenceId: number | null = null,
): Promise<number> {
  await manager.getRepository(PointsTransaction).insert({ userId, action, points, referenceId });
  await manager.getRepository(User).increment({ id: userId }, 'pointsBalance', points);
  const user = await manager.getRepository(User).findOneOrFail({ where: { id: userId } });
  return user.pointsBalance;
}
