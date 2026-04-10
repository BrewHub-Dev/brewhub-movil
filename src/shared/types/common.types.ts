export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
}

export interface ApiError {
  error: string;
  message?: string;
  statusCode?: number;
}

export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

export interface FavoriteItem {
  _id: string;
  userId: string;
  itemId: string;
  item?: any;
  createdAt: string;
}

export interface FavoriteItemData {
  _id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  categoryId?: string;
  modifiers?: any[];
}

export interface TimezoneInfo {
  timezone: string;
  offset: string;
  formatted: string;
}