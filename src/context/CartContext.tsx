import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { CartItem, Product, DeliveryDetails, Order, CustomerType, DeliveryMethod } from '../types';

const CART_STORAGE_KEY = 'cyden_cart_items_v2';
const ORDERS_STORAGE_KEY = 'cyden_customer_orders_v2';


// Cyden Eldoret Dispatch Depot (Rupa Godowns, Eldoret)
export const CYDEN_DEPOT = {
  name: 'Cyden Central Warehouse (Rupa Godowns, Eldoret)',
  lat: 0.5150,
  lng: 35.2883,
  freeThreshold: 1500, // KSh 1,500
  freeRadiusKm: 10, // 10 km free zone
  baseFee: 150, // Standard base fee if order < 1500
  perKmRate: 30, // KSh 30 per extra km beyond 10 km
  maxDeliveryRadiusKm: 50,
};

export function calculateDrivingDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
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
      console.warn('Failed to save cart to localStorage:', e);
    }
  }, [cart]);

  // Save recent orders
  const saveCompletedOrder = useCallback((order: Order) => {
    setRecentOrders((prev) => {
      const updated = [order, ...prev.filter((o) => o.order_id !== order.order_id)].slice(0, 15);
      try {
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save order to localStorage:', e);
      }
      return updated;
    });
  }, []);

  const addToCart = useCallback((product: Product, quantity = 1) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      } else {
        return [...prev, { product, quantity }];
      }
    });

    setLastAddedToast({ product, quantity });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setCart((prev) => {
      if (quantity <= 0) {
        return prev.filter((item) => item.product.id !== productId);
      }
      return prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      );
    });
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

  // Delivery fee logic:
  // - Pick up at depot: Free (KSH 0)
  // - Delivery fee is waived if subtotal >= 4000 KSH
  // - Otherwise flat KSH 150 within Eldoret / local radius
  const deliveryFee = useMemo(() => {
    if (cart.length === 0) return 0;
    if (deliveryDetails.deliveryMethod === 'pickup') return 0;
    if (subtotal >= 4000) return 0;
    return 150;
  }, [cart.length, deliveryDetails.deliveryMethod, subtotal]);

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
