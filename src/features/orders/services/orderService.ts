import { apiClient } from '../../../shared/services/apiClient';
import type { CreateOrderInput, Order } from '../../../shared/types/orders.types';

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

export async function getMyOrders(userId: string): Promise<Order[]> {
  try {
    const response = await apiClient.get(`/orders/user/${userId}`);
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
