export interface BranchAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface BranchLocation {
  lat: number;
  lng: number;
}

export interface Branch {
  _id: string;
  name: string;
  address: BranchAddress;
  phone: string;
  ShopId: string;
  active: boolean;
  location?: BranchLocation;
  timezone: string;
  openingHours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BranchesPagination {
  data: Branch[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
  };
}
