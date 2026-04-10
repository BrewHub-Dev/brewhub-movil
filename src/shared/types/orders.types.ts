export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "refunded";

export type PaymentMethod = "card" | "cash" | "wallet" | "bank_transfer" | "transfer" | "terminal";

export type OrderSource = "pos" | "app";

export interface OrderModifier {
  name?: string;
  optionName?: string;
  extraPrice?: number;
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

export interface OrderStatusHistory {
  status: OrderStatus;
  changedAt: string;
  changedBy?: string;
  changedByRole?: string;
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
  tip?: number;
  scheduledAt?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  orderNumberNumeric?: number;
  ShopId?: string;
  BranchId?: string;
  customerId?: string;
  source: OrderSource;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  tip?: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  statusHistory?: OrderStatusHistory[];
  notes?: string;
  customerNotes?: string;
  scheduledAt?: string;
  timezone?: string;
  qrToken?: string;
  qrTokenHash?: string;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
}

export interface OrderPagination {
  data: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
  };
}
