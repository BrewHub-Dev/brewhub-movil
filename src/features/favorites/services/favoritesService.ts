import { apiClient } from '@/shared/services/apiClient';

export interface Favorite {
  _id: string;
  userId: string;
  itemId: string;
  createdAt: string;
}

export interface FavoriteItem {
  _id: string;
  itemId: string;
  createdAt: string;
  item?: {
    _id: string;
    name: string;
    description?: string;
    price: number;
    images?: string[];
    rating?: number;
    ShopId?: string;
    active?: boolean;
    categoryId?: string;
    taxIncluded?: boolean;
    modifiers?: Array<{
      name: string;
      required: boolean;
      options: Array<{ name: string; extraPrice: number }>;
    }>;
  };
}

export const favoritesService = {
  async getFavorites(): Promise<FavoriteItem[]> {
    const response = await apiClient.get('/favorites');
    return response.data;
  },

  async getFavoritesByShopId(shopId: string): Promise<string[]> {
    const response = await apiClient.get(`/favorites?shopId=${shopId}`);
    const favorites: FavoriteItem[] = response.data;
    return favorites
      .filter((f) => f.item?.ShopId === shopId)
      .map((f) => f.itemId);
  },

  async addFavorite(itemId: string): Promise<Favorite> {
    const response = await apiClient.post('/favorites', { itemId });
    return response.data;
  },

  async removeFavorite(itemId: string): Promise<boolean> {
    const response = await apiClient.delete(`/favorites/${itemId}`);
    return response.data;
  },
};
