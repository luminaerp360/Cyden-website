/**
 * Core Type Definitions for Cyden Distributors Limited
 * Compliant with POS synchronization schema & TheBar marketplace adapter.
 */

export type ProductCategory =
  | 'Beer'
  | 'Gin'
  | 'Vodka'
  | 'Whisky'
  | 'Rum'
  | 'Liquor'
  | 'Wine'
  | 'Tequila';

export interface Product {
  id: string; // SKU or POS product identifier
  name: string; // e.g. "Tusker Cider 500ml"
  brand: string; // e.g. "Tusker"
  category: ProductCategory;
  size: string; // e.g. "500ml" / "750ml" / "1000ml"
  price: number; // in KSH (synced with ke.thebar.com RRP)
  currency: 'KSH';
  image_url: string | null;
  fallback_image_url?: string; // High-res asset fallback
  in_stock: boolean; // default true until POS sync provides real inventory
  featured: boolean; // drives "Most Popular Drinks" on Home
  description: string | null;
  abv?: string; // e.g. "4.5%", "40%"
  packaging?: string; // e.g. "Crate of 25", "Pack of 6", "Single Bottle"
  thebar_url?: string; // Direct deep link to ke.thebar.com product or search
  thebar_product_group_id?: number; // EABL / Agiza product group ID
  thebar_product_code?: string; // EABL item code / SKU
  thebar_rrp?: number; // Official Recommended Retail Price from TheBar
  thebar_synced?: boolean; // Indicates verified synchronization with ke.thebar.com catalog
  eabl_sku?: string; // Official EABL / Diageo master SKU
  last_synced_at?: string; // Last catalog sync timestamp
}

export interface ProductFilterOptions {
  category?: string;
  brand?: string;
  searchQuery?: string;
  sortBy?: 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'featured';
  inStockOnly?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type CustomerType = 'retail' | 'wholesale' | 'b2b' | 'personal';
export type DeliveryMethod = 'delivery' | 'pickup';

export interface CustomerAddress {
  _id?: string;
  id?: string;
  label?: string; // e.g. "Home", "Club / Outlet", "Warehouse", "Office"
  street?: string; // Street name / Area
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  landmark?: string; // Nearby landmark (e.g. "Opposite Shell, Black Gate")
  building?: string; // Building / Stall / Floor number
  contactPhone?: string; // Specific recipient phone
  deliveryInstructions?: string; // Notes for rider/driver
  lat?: number;
  lng?: number;
  googleMapsUrl?: string;
  isDefault?: boolean;
}

export interface DeliveryDetails {
  customerType: CustomerType;
  fullName: string;
  phone: string;
  email?: string;
  businessName?: string;
  deliveryMethod: DeliveryMethod;
  county: string;
  townArea: string;
  streetAddress: string;
  landmark?: string;
  building?: string;
  savedAddressId?: string;
  addressLabel?: string;
  gpsCoordinates?: { lat: number; lng: number; accuracy?: number };
  googleMapsUrl?: string;
  deliveryNotes?: string;
}

export type MpesaStatus = 'idle' | 'initiating' | 'pending_stk' | 'success' | 'failed' | 'timeout';

export interface MpesaTransaction {
  checkoutRequestId: string;
  receiptNumber: string;
  phone: string;
  amount: number;
  timestamp: string;
  status: 'completed' | 'failed';
}

export interface OrderItem {
  product_id: string;
  name: string;
  quantity: number;
  price: number;
  size?: string;
  image_url?: string | null;
}

export interface Order {
  order_id: string;
  source: 'thebar' | 'offline_request' | 'whatsapp' | 'web_cart';
  customer_type?: CustomerType;
  customer_name: string;
  customer_phone: string;
  outlet_name?: string;
  delivery_location?: string;
  delivery_method?: DeliveryMethod;
  items: OrderItem[];
  subtotal?: number;
  delivery_fee?: number;
  total: number;
  status: 'pending' | 'confirmed' | 'fulfilled' | 'cancelled';
  payment_method?: 'mpesa_stk' | 'cash_on_delivery' | 'invoice_b2b';
  mpesa_receipt?: string;
  created_at: string;
  notes?: string;
  gps_coords?: { lat: number; lng: number };
}

export interface Branch {
  id: string;
  name: string;
  type: 'Main Office' | 'Sub-Store';
  address: string;
  county: string;
  phone: string;
  phoneDisplay: string;
  mapEmbedUrl: string;
  googleMapsUrl: string;
  googleMapsDirectionsUrl?: string;
  coordinates?: { lat: number; lng: number };
  coordinatesDisplay?: string;
  landmarks?: string[];
  operatingHours: string;
  description: string;
}

export interface MilestoneDetail {
  label: string;
  value: string;
}

export interface Milestone {
  year: string;
  title: string;
  description: string;
  highlight?: boolean;
  badgeText?: string;
  details?: MilestoneDetail[];
}

export type RouteCategory = 'core_route' | 'van' | 'counter' | 'support';

export interface DistributionRoute {
  id: string;
  route: string;
  phoneNumber: string;
  phoneRaw: string;
  tillNumber?: string;
  site: string;
  category: RouteCategory;
  categoryLabel: string;
  waypoints?: string[];
  vehicleType?: string;
}
