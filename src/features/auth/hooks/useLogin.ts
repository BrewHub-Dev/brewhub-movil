import { useMutation } from '@tanstack/react-query';
import { loginUser } from '../services/authService';
import { useSetSession } from './useSession';
import { useTenant } from '@/features/tenant/providers/TenantProvider';
import type { LoginCredentials } from '../types/auth.types';

export function useLogin() {
  const setSession = useSetSession();
  const { setTenant } = useTenant();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => loginUser(credentials),
    onSuccess: async (data) => {
      await setSession(data.token, data.user);

      if (data.tenant) {
        await setTenant({
          tenantId: data.tenant.tenantId,
          shopName: data.tenant.shopName,
          shopLogo: data.tenant.shopLogo ?? undefined,
          branchId: data.tenant.branchId ?? undefined,
        });
      }
    },
  });
}
