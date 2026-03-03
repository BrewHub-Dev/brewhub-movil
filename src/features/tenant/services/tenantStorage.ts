import * as SecureStore from 'expo-secure-store';
import type { TenantContext } from '../types/tenant.types';

const TENANT_KEY = 'tenant_context';

export const saveTenantContext = async (context: TenantContext): Promise<void> => {
  try {
    await SecureStore.setItemAsync(TENANT_KEY, JSON.stringify(context));
  } catch (error) {
    console.error('Error saving tenant context:', error);
    throw error;
  }
};

export const getTenantContext = async (): Promise<TenantContext | null> => {
  try {
    const data = await SecureStore.getItemAsync(TENANT_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting tenant context:', error);
    return null;
  }
};


export const clearTenantContext = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(TENANT_KEY);
  } catch (error) {
    console.error('Error clearing tenant context:', error);
    throw error;
  }
};
