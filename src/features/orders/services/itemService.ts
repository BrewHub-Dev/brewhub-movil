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
