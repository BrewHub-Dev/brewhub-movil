export interface TenantContext {
  tenantId: string;
  shopName: string;
  shopLogo?: string;
  branchId?: string;
}

export interface ValidationResponse {
  ok: boolean;
  tenant: {
    tenantId: string;
    name: string;
    logo?: string;
    branchId?: string;
  };
}
