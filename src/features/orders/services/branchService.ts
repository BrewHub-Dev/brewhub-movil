import { apiClient } from '../../../shared/services/apiClient';
import type { Branch } from '../../../shared/types/branches.types';

export async function getBranches(): Promise<Branch[]> {
  try {
    const response = await apiClient.get('/branches');
    console.log('Fetched branches:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching branches:', error);
    throw new Error('No se pudieron cargar las tiendas');
  }
}

export async function getBranchesByShopId(shopId: string): Promise<Branch[]> {
  try {
    const response = await apiClient.get(`/branches/shop/${shopId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching branches by shop:', error);
    throw new Error('No se pudieron cargar las sucursales');
  }
}

export async function getBranchById(branchId: string): Promise<Branch> {
  try {
    const response = await apiClient.get(`/branches/${branchId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching branch:', error);
    throw new Error('No se pudo cargar la sucursal');
  }
}
