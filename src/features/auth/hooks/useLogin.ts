import { useMutation } from '@tanstack/react-query';
import { loginUser } from '../services/authService';
import { useSetSession } from './useSession';
import type { LoginCredentials } from '../types/auth.types';

export function useLogin() {
  const setSession = useSetSession();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => loginUser(credentials),
    onSuccess: async (data) => {
      await setSession(data.token, data.user);
    },
  });
}
