import { apiClient } from '../../../shared/services/apiClient';
import type { CreateOrderInput, Order } from '../../../shared/types/orders.types';

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedOrders {
  data: Order[];
  pagination: PaginationMeta;
}

export async function createOrder(orderData: CreateOrderInput): Promise<Order> {
  try {
    const response = await apiClient.post('/orders/app', orderData);
    return response.data;
  } catch (error: any) {
    console.error('Error creating order:', error);
    const message = error.response?.data?.error || 'No se pudo crear la orden';
    throw new Error(message);
  }
}

export async function getMyOrders(userId: string, page = 1, limit = 20): Promise<PaginatedOrders> {
  try {
    const response = await apiClient.get(`/orders/user/${userId}?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw new Error('No se pudieron cargar tus órdenes');
  }
}

export async function getOrderById(orderId: string): Promise<Order> {
  try {
    const response = await apiClient.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw new Error('No se pudo cargar la orden');
  }
}

export async function cancelOrder(orderId: string, notes?: string): Promise<Order> {
  try {
    const response = await apiClient.patch(`/orders/${orderId}/cancel`, { notes });
    return response.data;
  } catch (error: any) {
    console.error('Error cancelling order:', error);
    const message = error.response?.data?.error || 'No se pudo cancelar la orden';
    throw new Error(message);
  }
}

export async function reorder(orderId: string): Promise<{ items: any[]; BranchId: string }> {
  try {
    const response = await apiClient.post(`/orders/${orderId}/reorder`);
    return response.data;
  } catch (error: any) {
    console.error('Error reordering:', error);
    throw new Error(error.response?.data?.error || 'No se pudo reordenar');
  }
}
