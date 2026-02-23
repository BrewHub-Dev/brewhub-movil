import { apiClient } from '@/shared/services/apiClient';
import type { CountDashboard } from '../types/counts.types';

export async function getCountDashboard(userId: string): Promise<CountDashboard> {
  try {
    const response = await apiClient.get(`/orders/user/${userId}/dashboard-counts`);
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard counts:', error);
    throw new Error('No se pudieron cargar las estadísticas del dashboard');
  }
}
