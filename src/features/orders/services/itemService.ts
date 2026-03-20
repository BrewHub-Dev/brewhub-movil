import { apiClient } from '../../../shared/services/apiClient';
import type { Item } from '../../../shared/types/items.types';

export async function getItemsByShopId(shopId: string): Promise<Item[]> {
  try {
    const response = await apiClient.get(`/items/shop/${shopId}?limit=100`);
    const raw = response.data;
    if (raw && Array.isArray(raw.data)) {
      return raw.data;
    }
    return Array.isArray(raw) ? raw : [];
  } catch (error) {
    console.error('Error fetching items:', error);
    throw new Error('No se pudieron cargar los productos');
  }
}

export async function getItemById(itemId: string): Promise<Item> {
  try {
    const response = await apiClient.get(`/items/${itemId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching item:', error);
    throw new Error('No se pudo cargar el producto');
  }
}
