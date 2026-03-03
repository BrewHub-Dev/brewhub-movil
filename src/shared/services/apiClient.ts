import axios from 'axios';
import { getSession } from '../../features/auth/services/sessionStorage';
import { getTenantContext } from '../../features/tenant/services/tenantStorage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.11.115:3001';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const method = (config.method || 'GET').toUpperCase();
    console.log(`[API] ${method} ${config.baseURL}${config.url}`);

    const session = await getSession();
    if (session?.token) {
      config.headers.Authorization = `Bearer ${session.token}`;
    }

    const tenantContext = await getTenantContext();
    if (tenantContext?.tenantId) {
      config.headers['X-Tenant-Id'] = tenantContext.tenantId;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => {
    const method = (response.config.method || 'GET').toUpperCase();
    console.log(`[API OK] ${method} ${response.config.baseURL}${response.config.url} -> ${response.status}`);
    return response;
  },
  async (error) => {
    const method = (error.config?.method || 'GET').toUpperCase();
    const url = `${error.config?.baseURL || ''}${error.config?.url || ''}`;
    console.log(`[API ERROR] ${method} ${url} -> ${error.code || error.response?.status || 'UNKNOWN'}`);

    if (error.response?.status === 403) {
      const errorMsg = error.response?.data?.error;
      if (errorMsg?.includes('tenant')) {
        console.error('Tenant access denied:', errorMsg);
      }
    }

    throw error;
  },
);
