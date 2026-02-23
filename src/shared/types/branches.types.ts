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
}
