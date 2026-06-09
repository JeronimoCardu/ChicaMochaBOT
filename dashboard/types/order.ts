export interface OrderItem {
  product_name: string;
  quantity: number;
  size: "doble" | "triple" | "cuádruple";
  removed_ingredients: string[];
  extra_ingredients: string[];
  notes: string;
  base_price?: number;
  extra_price?: number;
  final_price?: number;
}

export type OrderState = "pending" | "preparing" | "ready" | "delivered";

export interface Order {
  id: string;
  cell: string;
  client: string;
  delivery_type: "delivery" | "pickup";
  address: string | null;
  requested_time: string | null;
  method_pay: "cash" | "transfer";
  items: OrderItem[];
  state: OrderState;
  total: number;
  subtotal?: number;
  created_at: string;
  customer_notes?: string | null;
}
