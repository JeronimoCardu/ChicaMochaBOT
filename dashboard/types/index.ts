export type BurgerSize = "simple" | "doble" | "triple" | "cuádruple";

export type DeliveryType = "delivery" | "pickup";
export type MethodPay = "cash" | "transfer" | "mp";
export type OrderState =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "sent"
  | "delivered"
  | "cancelled";
export type MessageRole = "user" | "assistant";

export interface PedidoItem {
  product_name: string;
  quantity: number;
  size: BurgerSize;
  removed_ingredients: string[];
  extra_ingredients: string[];
  base_price: number;
  extra_price: number;
  final_price: number;
  notes: string;
}

export interface Pedido {
  id: string;
  cell: string;
  client: string;
  delivery_type: DeliveryType;
  address: string | null;
  requested_time: string | null;
  method_pay: MethodPay;
  subtotal: number;
  total: number;
  items: PedidoItem[];
  customer_notes: string | null;
  internal_notes: string | null;
  state: OrderState;
  was_updated: boolean;
  created_at: string;
  updated_at: string;
  confirmed_at: string | null;
  delivered_at: string | null;
}

export interface Message {
  id: string;
  phone: string;
  role: MessageRole;
  content: string;
  created_at: string;
}

export interface Ingrediente {
  id: string;
  name: string;
  available: boolean;
}

export interface Combo {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  available: boolean | null;
}

export interface Handoff {
  id: string;
  cell: string;
  created_at: string;
}

export interface KPIData {
  totalRevenue: number;
  cashRevenue: number;
  transferRevenue: number;
  orderCount: number;
  burgerCount: number;
}

export interface Conversation {
  phone: string;
  lastMessage: string;
  lastRole: MessageRole;
  lastActivity: string;
  activePedido: Pedido | null;
  inHandoff: boolean;
}

export interface DailyStat {
  date: string;
  revenue: number;
  orders: number;
}

export interface HourlyStat {
  hour: string;
  orders: number;
  revenue: number;
}
