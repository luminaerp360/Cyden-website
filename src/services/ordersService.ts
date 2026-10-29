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
  paymentMethod: 'mpesa' | 'cash' | 'card' | string;
  paymentStatus?: 'pending' | 'paid' | 'failed' | string;
  status?: 'pending' | 'confirmed' | string;
  mpesaReceiptNumber?: string;
  customer?: {
    fullName?: string;
    email?: string;
    phone?: string;
    siteAddress?: string;
    notes?: string;
  };
  fulfillment?: 'delivery' | 'pickup' | string;
  deliveryFee?: number;
  deliveryDistanceKm?: number;
  deliveryCoordinates?: { lat: number; lng: number };
  subtotal?: number;
  totalAmount?: number;
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
  mpesaReceiptNumber?: string;
  fulfillment?: string;
  deliveryFee?: number;
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

export async function updateOrderPayment(
  orderId: string,
  payload: { paymentStatus: string; mpesaReceiptNumber?: string; status?: string },
  token?: string | null
): Promise<ApiOrder> {
  return apiRequest<ApiOrder>(`${API_ENDPOINTS.orders}/${encodeURIComponent(orderId)}/payment`, {
    method: 'PUT',
    body: payload,
    token,
  });
}

export async function fetchMyOrders(token?: string | null): Promise<ApiOrder[]> {
  return apiRequest<ApiOrder[]>(API_ENDPOINTS.orders, { token });
}

export async function fetchOrderById(id: string, token?: string | null): Promise<ApiOrder> {
  return apiRequest<ApiOrder>(`${API_ENDPOINTS.orders}/${encodeURIComponent(id)}`, { token });
}
