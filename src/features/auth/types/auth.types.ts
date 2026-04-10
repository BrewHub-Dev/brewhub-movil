export interface LoginCredentials {
  emailAddress: string;
  password: string;
}

export interface UserAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface UserTenant {
  tenantId: string;
  role: "CLIENT" | "SHOP_ADMIN" | "BRANCH_ADMIN";
  branchId?: string;
  addedAt?: string;
}

export interface AuthUser {
  _id: string;
  name: string;
  lastName?: string;
  username?: string;
  emailAddress: string;
  phone?: string;
  role: "ADMIN" | "SHOP_ADMIN" | "BRANCH_ADMIN" | "CLIENT";
  address?: UserAddress;
  pushTokens?: string[];
  ShopId?: string;
  BranchId?: string;
  tenants?: UserTenant[];
  notifications?: boolean;
  avatarUrl?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
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
