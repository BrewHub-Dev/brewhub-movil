import { getItem, setItem, deleteItem } from '@/shared/services/storage';
import type { TenantContext } from '../types/tenant.types';

const TENANT_KEY = 'tenant_context';

export const saveTenantContext = async (context: TenantContext): Promise<void> => {
  try {
    await setItem(TENANT_KEY, JSON.stringify(context));
  } catch (error) {
    console.error('Error saving tenant context:', error);
    throw error;
  }
};

export const getTenantContext = async (): Promise<TenantContext | null> => {
  try {
    const data = await getItem(TENANT_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting tenant context:', error);
    return null;
  }
};


export const clearTenantContext = async (): Promise<void> => {
  try {
    await deleteItem(TENANT_KEY);
  } catch (error) {
    console.error('Error clearing tenant context:', error);
    throw error;
  }
};
