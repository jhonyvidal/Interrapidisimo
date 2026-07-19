import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';
import { PaginatedResponse, Product } from '../models/product.model';

export interface ProductsQuery {
  page: number;
  limit: number;
  category?: string;
  search?: string;
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly http = inject(HttpClient);

  list(query: ProductsQuery): Observable<PaginatedResponse<Product>> {
    let params = new HttpParams().set('page', query.page).set('limit', query.limit);
    if (query.category) {
      params = params.set('category', query.category);
    }
    if (query.search) {
      params = params.set('search', query.search);
    }
    return this.http.get<PaginatedResponse<Product>>(`${API_BASE_URL}/products`, { params });
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${API_BASE_URL}/products/categories`);
  }

  toggleFavorite(productId: number): Observable<{ favorited: boolean; pointsBalance: number }> {
    return this.http.post<{ favorited: boolean; pointsBalance: number }>(
      `${API_BASE_URL}/products/${productId}/favorite`,
      {},
    );
  }
}
