import { apiClient } from '../../../shared/services/apiClient';
import type { Item } from '../../../shared/types/items.types';

export async function getItemsByShopId(shopId: string): Promise<Item[]> {
  try {
    const response = await apiClient.get(`/items/shop/${shopId}`);
    return response.data;
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
