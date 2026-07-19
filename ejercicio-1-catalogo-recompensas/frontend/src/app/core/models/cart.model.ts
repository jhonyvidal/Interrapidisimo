import { Product } from './product.model';

export interface CartItem {
  id: number;
  userId: number;
  product: Product;
  productId: number;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

export interface CheckoutResult {
  total: number;
  pointsEarned: number;
  pointsBalance: number;
}
