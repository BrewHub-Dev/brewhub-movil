import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getTenantContext, saveTenantContext, clearTenantContext } from '../services/tenantStorage';
import type { TenantContext } from '../types/tenant.types';

interface TenantContextType {
  tenant: TenantContext | null;
  setTenant: (tenant: TenantContext) => Promise<void>;
  clearTenant: () => Promise<void>;
  isLoading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

interface TenantProviderProps {
  children: ReactNode;
}

export const TenantProvider: React.FC<TenantProviderProps> = ({ children }) => {
  const [tenant, setTenantState] = useState<TenantContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTenant();
  }, []);

  const loadTenant = async () => {
    try {
      const savedTenant = await getTenantContext();
      setTenantState(savedTenant);
    } catch (error) {
      console.error('Error loading tenant:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setTenant = async (newTenant: TenantContext) => {
    try {
      await saveTenantContext(newTenant);
      setTenantState(newTenant);
    } catch (error) {
      console.error('Error setting tenant:', error);
      throw error;
    }
  };

  const clearTenant = async () => {
    try {
      await clearTenantContext();
      setTenantState(null);
    } catch (error) {
      console.error('Error clearing tenant:', error);
      throw error;
    }
  };

  return (
    <TenantContext.Provider value={{ tenant, setTenant, clearTenant, isLoading }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within TenantProvider');
  }
  return context;
};
