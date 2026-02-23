import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getSession, saveSession, clearSession, type StoredSession } from '../services/sessionStorage';
import type { AuthUser } from '../types/auth.types';

export const SESSION_QUERY_KEY = ['session'] as const;

export function useSession() {
  const { data, isLoading } = useQuery<StoredSession | null>({
    queryKey: SESSION_QUERY_KEY,
    queryFn: getSession,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
  });

  return {
    session: data ?? null,
    user: data?.user ?? null,
    token: data?.token ?? null,
    isLoading,
    isAuthenticated: !!data,
  };
}

export function useSetSession() {
  const queryClient = useQueryClient();

  return async (token: string, user: AuthUser) => {
    await saveSession(token, user);
    await queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
  };
}

export function useClearSession() {
  const queryClient = useQueryClient();

  return async () => {
    await clearSession();
    queryClient.setQueryData(SESSION_QUERY_KEY, null);
  };
}
