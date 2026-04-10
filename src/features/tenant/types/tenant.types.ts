export interface TenantContext {
  tenantId: string;
  shopName: string;
  shopLogo?: string | null;
  branchId?: string | null;
  timezone?: string;
  currency?: {
    code: string;
    symbol: string;
  };
  language?: string;
}

export interface TenantShop {
  _id: string;
  name: string;
  logo?: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  localization?: {
    timezone: string;
    currency: string;
    language: string;
  };
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ValidationResponse {
  ok: boolean;
  tenant: {
    tenantId: string;
    name: string;
    logo?: string;
    branchId?: string;
    timezone?: string;
    currency?: {
      code: string;
      symbol: string;
    };
  };
  error?: string;
}

export interface TenantSettings {
  notifications: boolean;
  darkMode: boolean;
  soundEffects: boolean;
}
