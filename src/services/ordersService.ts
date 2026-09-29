import { apiRequest } from './apiClient';
import { API_ENDPOINTS } from '../config';

export interface CreateOrderItem {
  productId: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface CreateOrderPayload {
  items: CreateOrderItem[];
  shippingAddress?: string;
  paymentMethod: 'mpesa' | 'cash' | 'card';
}

export interface OrderItemResponse {
  productId: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface ApiOrder {
  id: string;
  userId?: string;
  totalAmount: number;
  items: OrderItemResponse[];
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress?: string;
  paymentMethod: string;
  paymentStatus: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export async function createOrder(
  payload: CreateOrderPayload,
  token?: string | null
): Promise<ApiOrder> {
  const body: CreateOrderPayload = {
    ...payload,
    items: payload.items.map((item) => ({
      ...item,
      notes: item.notes ?? '',
    })),
  };
  return apiRequest<ApiOrder>(API_ENDPOINTS.orders, {
    method: 'POST',
    body,
    token,
  });
}

export async function fetchMyOrders(token?: string | null): Promise<ApiOrder[]> {
  return apiRequest<ApiOrder[]>(API_ENDPOINTS.orders, { token });
}

export async function fetchOrderById(id: string, token?: string | null): Promise<ApiOrder> {
  return apiRequest<ApiOrder>(`${API_ENDPOINTS.orders}/${encodeURIComponent(id)}`, { token });
}
