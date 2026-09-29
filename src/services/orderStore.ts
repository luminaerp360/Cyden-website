import { Order } from '../types';

const STORAGE_PREFIX = 'cyden_orders_v1';

export function getOrderStoreKey(userId: string | null): string {
  return userId ? `${STORAGE_PREFIX}_${userId}` : `${STORAGE_PREFIX}_guest`;
}

export function getStoredOrders(userId: string | null): Order[] {
  try {
    const raw = localStorage.getItem(getOrderStoreKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Order[]) : [];
  } catch {
    return [];
  }
}

export function saveOrderToStore(userId: string | null, order: Order): Order[] {
  const key = getOrderStoreKey(userId);
  const existing = getStoredOrders(userId);
  const updated = [
    order,
    ...existing.filter((o) => o.order_id !== order.order_id),
  ];
  try {
    localStorage.setItem(key, JSON.stringify(updated));
  } catch {
    // Storage unavailable
  }
  return updated;
}

export function clearStoredOrders(userId: string | null): void {
  try {
    localStorage.removeItem(getOrderStoreKey(userId));
  } catch {
    // ignore
  }
}

/**
 * Moves orders placed as a guest into the user's account history upon sign-in.
 */
export function migrateGuestOrders(userId: string): Order[] {
  const guestOrders = getStoredOrders(null);
  if (guestOrders.length === 0) return getStoredOrders(userId);
  const userOrders = getStoredOrders(userId);
  const merged = [...guestOrders, ...userOrders];
  const unique = Array.from(new Map(merged.map((o) => [o.order_id, o])).values());
  try {
    localStorage.setItem(getOrderStoreKey(userId), JSON.stringify(unique));
    localStorage.removeItem(getOrderStoreKey(null));
  } catch {
    // ignore
  }
  return unique;
}

export interface OrderStats {
  totalOrders: number;
  totalSpentKes: number;
  totalItems: number;
  pendingCount: number;
  confirmedCount: number;
  fulfilledCount: number;
  cancelledCount: number;
}

export function computeOrderStats(orders: Order[]): OrderStats {
  return orders.reduce<OrderStats>(
    (acc, order) => {
      acc.totalOrders += 1;
      acc.totalSpentKes += order.total;
      acc.totalItems += (order.items || []).reduce((sum, item) => sum + item.quantity, 0);
      const status = (order.status || '').toLowerCase();
      if (status.includes('cancel')) acc.cancelledCount += 1;
      else if (status.includes('fulfil') || status.includes('deliver')) acc.fulfilledCount += 1;
      else if (status.includes('confirm')) acc.confirmedCount += 1;
      else acc.pendingCount += 1;
      return acc;
    },
    {
      totalOrders: 0,
      totalSpentKes: 0,
      totalItems: 0,
      pendingCount: 0,
      confirmedCount: 0,
      fulfilledCount: 0,
      cancelledCount: 0,
    }
  );
}
