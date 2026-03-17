export interface LoginCredentials {
  emailAddress: string;
  password: string;
}

export interface AuthUser {
  _id: string;
  emailAddress: string;
  name: string;
}

export interface TenantInfo {
  tenantId: string;
  shopName: string;
  shopLogo?: string | null;
  branchId?: string | null;
}

export interface LoginResponse {
  ok: boolean;
  user: AuthUser;
  token: string;
  refreshToken?: string;
  tenant: TenantInfo | null;
}
