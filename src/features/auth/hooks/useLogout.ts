import { useClearSession } from './useSession';
import { useTenant } from '@/features/tenant/providers/TenantProvider';

export function useLogout() {
  const clearSession = useClearSession();
  const { clearTenant } = useTenant();

  return async () => {
    await clearSession();
    await clearTenant();
  };
}
