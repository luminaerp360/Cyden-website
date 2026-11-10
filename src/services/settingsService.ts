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

export interface HeroSlideSetting {
  id?: string;
  tag: string;
  headlineLine1: string;
  headlineLine2: string;
  subtitle: string;
  packshot: string;
  heroBg?: string;
  category: string;
  badgeTop: string;
  badgeBottom: string;
  badgeColor?: string;
  bgGradient?: string;
  curtainColor?: string;
  legalText?: string;
  isActive?: boolean;
  order?: number;
}

export interface StoreSettingsResponse {
  shipping?: Partial<ShippingSettings>;
  heroSlides?: HeroSlideSetting[];
  [key: string]: unknown;
}

const SETTINGS_CACHE_KEY = 'cyden_store_shipping_settings_v1';
const HERO_SLIDES_CACHE_KEY = 'cyden_store_hero_slides_v1';

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

export function getCachedHeroSlides(): HeroSlideSetting[] | null {
  try {
    if (typeof localStorage !== 'undefined') {
      const cached = localStorage.getItem(HERO_SLIDES_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    }
  } catch {
    // Ignore JSON errors
  }
  return null;
}

export async function fetchLiveHeroSlides(): Promise<HeroSlideSetting[] | null> {
  try {
    const res = await apiRequest<StoreSettingsResponse>('/settings');
    if (Array.isArray(res?.heroSlides) && res.heroSlides.length > 0) {
      const active = res.heroSlides.filter((s) => s.isActive !== false);
      if (active.length > 0) {
        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(HERO_SLIDES_CACHE_KEY, JSON.stringify(active));
          }
        } catch {
          // ignore quota
        }
        return active;
      }
    }
  } catch (err) {
    console.warn('Using fallback hero slides:', err);
  }
  return getCachedHeroSlides();
}

