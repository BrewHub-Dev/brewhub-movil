import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Constants from 'expo-constants';
import axios from 'axios';
import { getTenantContext, saveTenantContext, clearTenantContext } from '../services/tenantStorage';
import type { TenantContext } from '../types/tenant.types';

const API_URL = process.env.EXPO_PUBLIC_API_URL || '';

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

  const fetchBranding = async (tenantId: string): Promise<{ 
    name: string; 
    image: string | null;
    timezone?: string;
    currency?: { code: string; symbol: string };
    language?: string;
  } | null> => {
    try {
      const { data } = await axios.get(`${API_URL}/shops/${tenantId}/branding`);
      return data;
    } catch (error) {
      console.error('Error fetching shop branding:', error);
      return null;
    }
  };

  const loadTenant = async () => {
    try {
      const savedTenant = await getTenantContext();

      if (savedTenant) {
        setTenantState(savedTenant);

        if (!savedTenant.shopLogo || !savedTenant.timezone) {
          const branding = await fetchBranding(savedTenant.tenantId);
          if (branding) {
            const updated = { 
              ...savedTenant, 
              shopName: branding.name, 
              shopLogo: branding.image,
              timezone: branding.timezone,
              currency: branding.currency,
              language: branding.language,
            };
            await saveTenantContext(updated);
            setTenantState(updated);
          }
        }
      } else {
        const brandTenantId = Constants.expoConfig?.extra?.brand?.tenantId as string | null;
        const brandShopName = Constants.expoConfig?.extra?.brand?.shopName as string | undefined;
        const brandAppName = Constants.expoConfig?.extra?.brand?.appName as string | undefined;

        if (brandTenantId) {
          const branding = await fetchBranding(brandTenantId);
          const autoTenant: TenantContext = {
            tenantId: brandTenantId,
            shopName: branding?.name ?? brandShopName ?? brandAppName ?? 'BrewHub',
            shopLogo: branding?.image ?? undefined,
            timezone: branding?.timezone ?? 'UTC',
            currency: branding?.currency,
            language: branding?.language ?? 'es',
          };
          await saveTenantContext(autoTenant);
          setTenantState(autoTenant);
        }
      }
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
