export interface LoginCredentials {
  emailAddress: string;
  password: string;
}

export interface AuthUser {
  _id: string;
  emailAddress: string;
  name: string;
}

export interface LoginResponse {
  ok: boolean;
  user: AuthUser;
  token: string;
}
