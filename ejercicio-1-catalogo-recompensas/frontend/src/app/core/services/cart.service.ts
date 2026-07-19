import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';
import { Cart, CheckoutResult } from '../models/cart.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly http = inject(HttpClient);

  getCart(): Observable<Cart> {
    return this.http.get<Cart>(`${API_BASE_URL}/cart`);
  }

  addItem(productId: number, quantity = 1): Observable<Cart & { pointsBalance: number }> {
    return this.http.post<Cart & { pointsBalance: number }>(`${API_BASE_URL}/cart/items`, { productId, quantity });
  }

  removeItem(productId: number): Observable<Cart> {
    return this.http.delete<Cart>(`${API_BASE_URL}/cart/items/${productId}`);
  }

  checkout(): Observable<CheckoutResult> {
    return this.http.post<CheckoutResult>(`${API_BASE_URL}/checkout`, {});
  }
}
