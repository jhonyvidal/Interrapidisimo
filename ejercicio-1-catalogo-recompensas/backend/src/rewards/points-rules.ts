// Reglas de puntos: viven solo aqui. El cliente nunca decide cuantos
// puntos otorgar, solo llama a la accion y el servidor calcula.
export const POINTS_RULES = {
  ADD_TO_CART: 5,
  FAVORITE: 2,
} as const;

const MIN_PURCHASE_POINTS = 20;
const PURCHASE_POINTS_PER_10K = 1;

export function calculatePurchasePoints(total: number): number {
  const earned = Math.floor(total / 10000) * PURCHASE_POINTS_PER_10K;
  return Math.max(MIN_PURCHASE_POINTS, earned);
}
