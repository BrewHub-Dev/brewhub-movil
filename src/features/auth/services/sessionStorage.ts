import { getItem, setItem, deleteItem } from '@/shared/services/storage';
import type { AuthUser } from '../types/auth.types';

const SESSION_KEY = 'brewhub_session';

export interface StoredSession {
  token: string;
  user: AuthUser;
  expiresAt: number; // ms timestamp
}

function parseJWTExpiry(token: string): number {
  try {
    const base64Payload = token.split('.')[1].replaceAll('-', '+').replaceAll('_', '/');
    const payload = JSON.parse(atob(base64Payload));
    return payload.exp * 1000;
  } catch (error) {
    return Date.now() + 24 * 60 * 60 * 1000;
  }
}

export async function saveSession(token: string, user: AuthUser): Promise<void> {
  const session: StoredSession = {
    token,
    user,
    expiresAt: parseJWTExpiry(token),
  };
  await setItem(SESSION_KEY, JSON.stringify(session));
}

export async function getSession(): Promise<StoredSession | null> {
  const raw = await getItem(SESSION_KEY);
  if (!raw) return null;

  const session: StoredSession = JSON.parse(raw);

  if (Date.now() >= session.expiresAt) {
    await deleteItem(SESSION_KEY);
    return null;
  }

  return session;
}

export async function clearSession(): Promise<void> {
  await deleteItem(SESSION_KEY);
}
