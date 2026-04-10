export interface ItemModifierOption {
  name: string;
  extraPrice: number;
}

export interface ItemModifier {
  name: string;
  required: boolean;
  options: ItemModifierOption[];
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  ShopId: string;
  image?: string;
  active?: boolean;
  sortOrder?: number;
}

export interface Item {
  _id: string;
  name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  ShopId: string;
  BranchId?: string;
  price: number;
  cost?: number;
  active: boolean;
  categoryId: string;
  category?: Category;
  taxIncluded: boolean;
  images?: string[];
  modifiers?: ItemModifier[];
  rating?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ItemsPagination {
  data: Item[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
  };
}
