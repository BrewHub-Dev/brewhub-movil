import type { LoginCredentials, LoginResponse } from '../types/auth.types';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || '';

export async function loginUser(credentials: LoginCredentials): Promise<LoginResponse> {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials);
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
  }

  throw new Error('Correo o contraseña incorrectos');
}

export interface RegisterData {
  name: string;
  emailAddress: string;
  password: string;
  inviteCode: string;
}

export async function registerWithInviteCode(data: RegisterData): Promise<void> {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, data);
    return response.data;
  } catch (error: any) {
    console.error('Register error:', error);
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error('No se pudo completar el registro. Verifica el código de invitación.');
  }
}

export interface RegisterDirectData {
  name: string;
  emailAddress: string;
  password: string;
  tenantId: string;
}

export async function registerUser(data: RegisterDirectData): Promise<void> {
  try {
    const response = await axios.post(`${API_URL}/auth/register-direct`, data);
    return response.data;
  } catch (error: any) {
    console.error('Register direct error:', error);
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error('No se pudo completar el registro.');
  }
}
