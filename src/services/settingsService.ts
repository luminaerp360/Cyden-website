import { apiRequest } from './apiClient';

export interface ShippingSettings {
  orderPrefix?: string;
  minOrderAmount?: number;
  freeShippingThreshold: number;
  flatShippingRate?: number;
  freeDeliveryRadiusKm: number;
  baseDeliveryFee: number;
  perKmRateBeyondRadius: number;
  maxDeliveryRadiusKm?: number;
  depotName: string;
  depotLat: number;
  depotLng: number;
  depotAddress?: string;
}

export interface StoreSettingsResponse {
  shipping?: Partial<ShippingSettings>;
  [key: string]: unknown;
}

const SETTINGS_CACHE_KEY = 'cyden_store_shipping_settings_v1';

export const DEFAULT_SHIPPING_SETTINGS: ShippingSettings = {
  freeShippingThreshold: 1500,
  freeDeliveryRadiusKm: 10,
  baseDeliveryFee: 150,
  flatShippingRate: 150,
  perKmRateBeyondRadius: 30,
  maxDeliveryRadiusKm: 50,
  depotName: 'Rupa Godowns, Eldoret (Main Depot)',
  depotLat: 0.5150,
  depotLng: 35.2883,
  depotAddress: 'Rupa Godowns, Off Nakuru-Eldoret Highway, Eldoret',
};

export function getCachedShippingSettings(): ShippingSettings {
  try {
    if (typeof localStorage !== 'undefined') {
      const cached = localStorage.getItem(SETTINGS_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed.freeShippingThreshold === 'number') {
          return { ...DEFAULT_SHIPPING_SETTINGS, ...parsed };
        }
      }
    }
  } catch {
    // Ignore JSON parse errors
  }
  return DEFAULT_SHIPPING_SETTINGS;
}

export async function fetchLiveShippingSettings(): Promise<ShippingSettings> {
  try {
    const res = await apiRequest<StoreSettingsResponse>('/settings');
    if (res?.shipping && typeof res.shipping.freeShippingThreshold === 'number') {
      const merged: ShippingSettings = {
        ...DEFAULT_SHIPPING_SETTINGS,
        ...res.shipping,
        // Ensure numeric types
        freeShippingThreshold: Number(res.shipping.freeShippingThreshold) || 1500,
        freeDeliveryRadiusKm: Number(res.shipping.freeDeliveryRadiusKm) || 10,
        baseDeliveryFee: Number(res.shipping.baseDeliveryFee) || 150,
        perKmRateBeyondRadius: Number(res.shipping.perKmRateBeyondRadius) || 30,
        depotLat: Number(res.shipping.depotLat) || 0.5150,
        depotLng: Number(res.shipping.depotLng) || 35.2883,
      };

      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(merged));
        }
      } catch {
        // Ignore storage quotas
      }
      return merged;
    }
  } catch (err) {
    console.warn('Using cached/default shipping settings:', err);
  }

  return getCachedShippingSettings();
}

