import { useClearSession } from './useSession';

export function useLogout() {
  const clearSession = useClearSession();
  return clearSession;
}
