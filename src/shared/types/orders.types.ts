export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "refunded";

export type PaymentMethod = "card" | "cash" | "wallet" | "bank_transfer";

export interface OrderModifier {
  name: string;
  optionName: string;
  extraPrice: number;
}

export interface OrderItem {
  itemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  modifiers?: OrderModifier[];
  itemTotal: number;
  notes?: string;
}

export interface CreateOrderItemInput {
  itemId: string;
  quantity: number;
  modifiers?: {
    name: string;
    optionName: string;
  }[];
  notes?: string;
}

export interface CreateOrderInput {
  BranchId: string;
  items: CreateOrderItemInput[];
  paymentMethod: PaymentMethod;
  paymentStatus?: PaymentStatus;
  customerNotes?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  ShopId: string;
  BranchId: string;
  customerId?: string;
  source: "pos" | "app";
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  notes?: string;
  customerNotes?: string;
  qrToken?: string;
  qrTokenHash?: string;
  createdAt: string;
  updatedAt: string;
}
