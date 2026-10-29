import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { CartItem, Product, DeliveryDetails, Order, CustomerType, DeliveryMethod } from '../types';
import {
  fetchLiveShippingSettings,
  getCachedShippingSettings,
  ShippingSettings,
  DEFAULT_SHIPPING_SETTINGS,
} from '../services/settingsService';

const CART_STORAGE_KEY = 'cyden_cart_items_v2';
const ORDERS_STORAGE_KEY = 'cyden_customer_orders_v2';

export function calculateDrivingDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightDist = R * c;
  // Road network factor (~1.25x)
  return Math.round(straightDist * 1.25 * 10) / 10;
}

export const POPULAR_DELIVERY_AREAS = [
  'Town Route (Town, Kimumu, Chepkanga, Munyaka, Sogomo, Marura)',
  'Langas Route (Pioneer, Elgon View, Langas, Kapseret)',
  'Van A (Eldoret CBD & Langas - UDV Spirits)',
  'Van B (Annex, Rupa, Kipkorgot, Kimumu, Marura - UDV Spirits)',
  'Flax / Metkei Route (Annex, Naiberi, Kaptagat, Flax, Chepkorio, Metkei)',
  'Selia / Kesses Route (Selia, Mosop, Kabiyet, Nandi Hills, Lessos, Moi Univ)',
  'Nandi / Burnt Route (Kapseret, Mosoriot, Kapsabet, Cheptiret, Burnt Forest)',
  'Iten Route (Iten, Kapsowar, Kapkoi, Sergoit, Biretwo)',
  'Rupa Godowns Counter (Eldoret Main Depot Walk-in)',
  'Iten Sub-Store Counter (Sitet Building Walk-in)',
  'Eldoret CBD / Town Centre',
  'Kapsoya Estate',
  'Huruma / West Indies',
];

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string) => number;
  totalItems: number;
  subtotal: number;
  deliveryFee: number;
  deliveryDistanceKm: number | null;
  deliveryExplanation: string;
  isFreeDelivery: boolean;
  shippingSettings: ShippingSettings;
  grandTotal: number;
  deliveryDetails: DeliveryDetails;
  setDeliveryDetails: React.Dispatch<React.SetStateAction<DeliveryDetails>>;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  openCheckout: (customerType?: CustomerType) => void;
  isWhatsAppModalOpen: boolean;
  setIsWhatsAppModalOpen: (open: boolean) => void;
  openWhatsAppOrder: (orderType?: 'b2b' | 'personal') => void;
  quickOrderProduct: (product: Product, customerType?: CustomerType) => void;
  lastAddedToast: { product: Product; quantity: number } | null;
  dismissToast: () => void;
  recentOrders: Order[];
  saveCompletedOrder: (order: Order) => void;
}

const initialDeliveryDetails: DeliveryDetails = {
  customerType: 'retail',
  fullName: '',
  phone: '',
  email: '',
  businessName: '',
  deliveryMethod: 'delivery',
  county: 'Uasin Gishu',
  townArea: 'Eldoret CBD / Town Centre',
  streetAddress: '',
  deliveryNotes: '',
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [deliveryDetails, setDeliveryDetails] = useState<DeliveryDetails>(initialDeliveryDetails);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [lastAddedToast, setLastAddedToast] = useState<{ product: Product; quantity: number } | null>(null);

  // Live Shipping Settings from backend (with instant cached fallback)
  const [shippingSettings, setShippingSettings] = useState<ShippingSettings>(getCachedShippingSettings);

  useEffect(() => {
    fetchLiveShippingSettings().then((live) => {
      setShippingSettings(live);
    });
  }, []);

  const [recentOrders, setRecentOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.warn('Could not save cart to storage:', e);
    }
  }, [cart]);

  // Save orders to localStorage
  const saveCompletedOrder = useCallback((order: Order) => {
    setRecentOrders((prev) => {
      const updated = [order, ...prev.filter((o) => o.id !== order.id)].slice(0, 50);
      try {
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not save order history:', e);
      }
      return updated;
    });
  }, []);

  // Cart operations
  const addToCart = useCallback((product: Product, quantity = 1) => {
    if (quantity <= 0) return;
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
        };
        return next;
      }
      return [...prev, { product, quantity }];
    });

    setLastAddedToast({ product, quantity });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.product.id !== productId));
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const getItemQuantity = useCallback(
    (productId: string) => {
      const item = cart.find((i) => i.product.id === productId);
      return item ? item.quantity : 0;
    },
    [cart]
  );

  const dismissToast = useCallback(() => {
    setLastAddedToast(null);
  }, []);

  // Auto dismiss toast after 3.5s
  useEffect(() => {
    if (lastAddedToast) {
      const timer = setTimeout(() => {
        setLastAddedToast(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [lastAddedToast]);

  const quickOrderProduct = useCallback(
    (product: Product, customerType?: CustomerType) => {
      addToCart(product, 1);
      if (customerType) {
        setDeliveryDetails((prev) => ({ ...prev, customerType }));
      }
      setIsCartOpen(true);
    },
    [addToCart]
  );

  const openCheckout = useCallback((customerType?: CustomerType) => {
    if (customerType) {
      setDeliveryDetails((prev) => ({ ...prev, customerType }));
    }
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  }, []);

  const openWhatsAppOrder = useCallback((orderType?: 'b2b' | 'personal') => {
    if (orderType) {
      setDeliveryDetails((prev) => ({
        ...prev,
        customerType: orderType === 'b2b' ? 'b2b' : 'retail',
      }));
    }
    setIsCartOpen(false);
    setIsWhatsAppModalOpen(true);
  }, []);

  // Pricing calculations
  const totalItems = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cart]);

  // Delivery Fee Calculation Engine based on dynamic Shipping Settings:
  // - Pickup at depot: Always FREE (0)
  // - If subtotal >= freeShippingThreshold within freeDeliveryRadiusKm (10 km): 100% FREE
  // - If subtotal < freeShippingThreshold within 10 km: baseDeliveryFee (KES 150)
  // - Beyond freeDeliveryRadiusKm:
  //     - If subtotal >= freeShippingThreshold: (distance - 10 km) * perKmRate
  //     - If subtotal < freeShippingThreshold: baseDeliveryFee + (distance - 10 km) * perKmRate
  // - Fallback when coordinates are not yet pinned (e.g. Step 1):
  //     - If subtotal >= freeShippingThreshold: FREE (0)
  //     - If subtotal < freeShippingThreshold: baseDeliveryFee (KES 150)
  const deliveryCalculation = useMemo(() => {
    if (cart.length === 0) {
      return { fee: 0, distance: null, explanation: 'Cart is empty', isFree: true };
    }

    if (deliveryDetails.deliveryMethod === 'pickup') {
      return {
        fee: 0,
        distance: 0,
        explanation: 'Self-pickup at Rupa Godowns / Iten Counter (Free)',
        isFree: true,
      };
    }

    const threshold = Number(shippingSettings.freeShippingThreshold) || 1500;
    const radius = Number(shippingSettings.freeDeliveryRadiusKm) || 10;
    const baseFee = Number(shippingSettings.baseDeliveryFee) || 150;
    const perKmRate = Number(shippingSettings.perKmRateBeyondRadius) || 30;
    const depotLat = Number(shippingSettings.depotLat) || 0.5150;
    const depotLng = Number(shippingSettings.depotLng) || 35.2883;

    const coords = deliveryDetails.gpsCoordinates;
    if (coords && typeof coords.lat === 'number' && typeof coords.lng === 'number') {
      const distance = calculateDrivingDistanceKm(depotLat, depotLng, coords.lat, coords.lng);
      const isWithinFreeRadius = distance <= radius;
      const qualifiesForFreeAmount = subtotal >= threshold;

      if (isWithinFreeRadius) {
        if (qualifiesForFreeAmount) {
          return {
            fee: 0,
            distance,
            explanation: `Free Delivery (Within ${distance} km • Order over KSh ${threshold.toLocaleString()})`,
            isFree: true,
          };
        } else {
          return {
            fee: baseFee,
            distance,
            explanation: `Base Fee KSh ${baseFee} (${distance} km from depot • Add KSh ${(threshold - subtotal).toLocaleString()} for free delivery)`,
            isFree: false,
          };
        }
      } else {
        const extraKm = Math.ceil(distance - radius);
        const distanceSurcharge = extraKm * perKmRate;

        if (qualifiesForFreeAmount) {
          return {
            fee: distanceSurcharge,
            distance,
            explanation: `KSh ${distanceSurcharge} (${distance} km: First ${radius} km FREE + ${extraKm} km extra @ KSh ${perKmRate}/km)`,
            isFree: false,
          };
        } else {
          const totalFee = baseFee + distanceSurcharge;
          return {
            fee: totalFee,
            distance,
            explanation: `KSh ${totalFee} (${distance} km: Base KSh ${baseFee} + ${extraKm} km extra @ KSh ${perKmRate}/km)`,
            isFree: false,
          };
        }
      }
    }

    // Fallback when no GPS pin is provided yet (e.g. Step 1 Cart Review)
    if (subtotal >= threshold) {
      return {
        fee: 0,
        distance: null,
        explanation: `Free Delivery (Order over KSh ${threshold.toLocaleString()} within local Eldoret radius)`,
        isFree: true,
      };
    }

    return {
      fee: baseFee,
      distance: null,
      explanation: `Standard Delivery Fee (KSh ${baseFee})`,
      isFree: false,
    };
  }, [
    cart.length,
    deliveryDetails.deliveryMethod,
    deliveryDetails.gpsCoordinates,
    subtotal,
    shippingSettings,
  ]);

  const deliveryFee = deliveryCalculation.fee;
  const deliveryDistanceKm = deliveryCalculation.distance;
  const deliveryExplanation = deliveryCalculation.explanation;
  const isFreeDelivery = deliveryCalculation.isFree;

  const grandTotal = useMemo(() => {
    return subtotal + deliveryFee;
  }, [subtotal, deliveryFee]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getItemQuantity,
        totalItems,
        subtotal,
        deliveryFee,
        deliveryDistanceKm,
        deliveryExplanation,
        isFreeDelivery,
        shippingSettings,
        grandTotal,
        deliveryDetails,
        setDeliveryDetails,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        openCheckout,
        isWhatsAppModalOpen,
        setIsWhatsAppModalOpen,
        openWhatsAppOrder,
        quickOrderProduct,
        lastAddedToast,
        dismissToast,
        recentOrders,
        saveCompletedOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
