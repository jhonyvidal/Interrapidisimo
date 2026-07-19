export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  stock: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
