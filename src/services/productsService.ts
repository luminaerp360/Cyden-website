import { apiRequest } from './apiClient';
import { API_ENDPOINTS } from '../config';
import { Product, ProductCategory, ProductFilterOptions } from '../types';
import { SYNCED_THEBAR_CATALOGUE } from '../data/thebarCatalog';

export interface ApiCategory {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  slug?: string;
  isActive?: boolean;
}

export interface ApiProductVariant {
  name?: string;
  sku?: string;
  price?: number;
  stockQuantity?: number;
  attributes?: Record<string, unknown>;
}

export interface ApiProduct {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  price?: number;
  categories?: (string | ApiCategory)[];
  images?: string[];
  variants?: ApiProductVariant[];
  brand?: string;
  isActive?: boolean;
  featured?: boolean;
  specifications?: {
    category?: string;
    origin?: string;
    abv?: string | number | null;
    volumeMl?: number;
    casePack?: number;
    kraStampVerified?: boolean;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface ProductQuery {
  search?: string;
  isActive?: boolean;
  featured?: boolean;
  brand?: string;
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
}

export interface NormalizedCatalog {
  products: Product[];
  categories: ApiCategory[];
}

function guessCategory(raw: ApiProduct, categoryNameById: Map<string, string>): ProductCategory {
  const specCat = String(raw.specifications?.category || '').toLowerCase();
  const name = (raw.name || '').toLowerCase();
  const brand = (raw.brand || '').toLowerCase();

  // Check category ids attached to product
  if (raw.categories && raw.categories.length > 0) {
    for (const c of raw.categories) {
      const catName = (typeof c === 'string' ? categoryNameById.get(c) || c : c.name || '').toLowerCase();
      if (catName.includes('beer') || catName.includes('cider')) return 'Beer';
      if (catName.includes('whiskey') || catName.includes('whisky')) return 'Whisky';
      if (catName.includes('gin')) return 'Gin';
      if (catName.includes('vodka')) return 'Vodka';
      if (catName.includes('rum')) return 'Rum';
      if (catName.includes('wine')) return 'Wine';
      if (catName.includes('champagne')) return 'Wine';
      if (catName.includes('liqueur') || catName.includes('brandy') || catName.includes('cognac')) return 'Liquor';
      if (catName.includes('tequila')) return 'Tequila';
    }
  }

  if (specCat.includes('beer') || specCat.includes('cider')) return 'Beer';
  if (specCat.includes('whiskey') || specCat.includes('whisky')) return 'Whisky';
  if (specCat.includes('gin')) return 'Gin';
  if (specCat.includes('vodka')) return 'Vodka';
  if (specCat.includes('rum')) return 'Rum';
  if (specCat.includes('wine') || specCat.includes('champagne')) return 'Wine';
  if (specCat.includes('liqueur') || specCat.includes('brandy')) return 'Liquor';
  if (specCat.includes('tequila')) return 'Tequila';

  if (name.includes('tusker') || name.includes('guinness') || name.includes('white cap') || name.includes('balozi') || name.includes('cider') || name.includes('pilsner')) return 'Beer';
  if (name.includes('johnnie walker') || name.includes('vat 69') || name.includes('black & white') || name.includes('singleton') || name.includes('talusker') || name.includes('whisky') || name.includes('whiskey')) return 'Whisky';
  if (name.includes('gin') || name.includes('gordon') || name.includes('tanqueray') || name.includes('gilbey') || name.includes('chrome gin')) return 'Gin';
  if (name.includes('vodka') || name.includes('smirnoff') || name.includes('chrome vodka') || name.includes('ciroc')) return 'Vodka';
  if (name.includes('rum') || name.includes('captain morgan') || name.includes('myers')) return 'Rum';
  if (name.includes('baileys') || name.includes('liqueur') || name.includes('brandy') || name.includes('cognac') || name.includes('richot') || name.includes('viceroy')) return 'Liquor';
  if (name.includes('tequila') || name.includes('don julio')) return 'Tequila';
  if (name.includes('wine')) return 'Wine';

  return 'Beer';
}

export function normalizeApiProduct(
  raw: ApiProduct,
  categoryNameById: Map<string, string>,
  index: number
): Product {
  const id = String(raw._id ?? raw.id ?? `CYD-${index}`);
  const category = guessCategory(raw, categoryNameById);
  const primaryVariant = raw.variants?.[0];
  const variantPrice = typeof primaryVariant?.price === 'number' ? primaryVariant.price : undefined;
  const topPrice = typeof raw.price === 'number' ? raw.price : undefined;
  const price = (topPrice && topPrice > 0 ? topPrice : variantPrice) || 1500;

  const stockQuantity = typeof primaryVariant?.stockQuantity === 'number' ? primaryVariant.stockQuantity : 10;
  const inStock = raw.isActive !== false && stockQuantity > 0;

  const specs = raw.specifications ?? {};
  const volumeMl = typeof specs.volumeMl === 'number' ? specs.volumeMl : 750;
  const size = `${volumeMl}ml`;
  const abv = specs.abv ? `${specs.abv}%` : category === 'Beer' ? '4.5%' : '40%';
  const image_url = raw.images?.[0] || null;

  return {
    id,
    name: raw.name,
    brand: raw.brand || 'EABL',
    category,
    size,
    price,
    currency: 'KSH',
    image_url,
    fallback_image_url: undefined,
    in_stock: inStock,
    featured: Boolean(raw.featured),
    description: raw.description || `${raw.name} — genuine wholesale beverage supply.`,
    abv,
    packaging: specs.casePack ? `Pack of ${specs.casePack}` : 'Bottle / Pack',
    thebar_url: `https://ke.thebar.com/#/search?q=${encodeURIComponent(raw.name)}`,
    thebar_synced: true,
    last_synced_at: new Date().toISOString(),
  };
}

function buildCategoryIdMap(categories: ApiCategory[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const cat of categories) {
    const id = cat._id ?? cat.id;
    if (id) map.set(String(id), cat.name);
  }
  return map;
}

function buildQueryString(query: ProductQuery = {}): string {
  const params = new URLSearchParams();
  if (query.search) params.set('search', query.search);
  if (query.isActive !== undefined) params.set('isActive', String(query.isActive));
  if (query.featured !== undefined) params.set('featured', String(query.featured));
  if (query.brand) params.set('brand', query.brand);
  if (query.categories?.length) params.set('categories', query.categories.join(','));
  if (query.minPrice !== undefined) params.set('minPrice', String(query.minPrice));
  if (query.maxPrice !== undefined) params.set('maxPrice', String(query.maxPrice));
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export async function fetchCategories(): Promise<ApiCategory[]> {
  try {
    return await apiRequest<ApiCategory[]>(API_ENDPOINTS.categories);
  } catch (err) {
    console.warn('Failed to fetch categories from backend:', err);
    return [];
  }
}

export async function fetchProducts(query: ProductQuery = {}): Promise<ApiProduct[]> {
  return apiRequest<ApiProduct[]>(`${API_ENDPOINTS.products}${buildQueryString(query)}`);
}

export async function fetchProductById(id: string, token?: string | null): Promise<ApiProduct> {
  return apiRequest<ApiProduct>(`${API_ENDPOINTS.products}/${encodeURIComponent(id)}`, { token });
}

export async function fetchFeaturedProducts(): Promise<ApiProduct[]> {
  return apiRequest<ApiProduct[]>(API_ENDPOINTS.productsFeatured);
}

export async function fetchActiveProducts(): Promise<ApiProduct[]> {
  return apiRequest<ApiProduct[]>(API_ENDPOINTS.productsActive);
}

/**
 * Loads normalized products from the live backend.
 * Falls back safely to SEED_PRODUCTS if offline or empty.
 */
export async function fetchNormalizedCatalog(): Promise<NormalizedCatalog> {
  try {
    const [categories, rawProducts] = await Promise.all([
      fetchCategories(),
      fetchProducts(),
    ]);

    if (Array.isArray(rawProducts) && rawProducts.length > 0) {
      backendProductsCache = rawProducts;
      const categoryMap = buildCategoryIdMap(categories);
      const products = rawProducts.map((raw, index) =>
        normalizeApiProduct(raw, categoryMap, index)
      );
      return { products, categories };
    }
  } catch (err) {
    console.warn('Backend catalog request failed, using local catalogue:', err);
  }

  return {
    products: SYNCED_THEBAR_CATALOGUE,
    categories: [],
  };
}

let backendProductsCache: ApiProduct[] = [];

/**
 * Resolves a cart product's identifier to a valid backend MongoDB ObjectId.
 */
export async function resolveBackendProductId(
  cartProductId: string,
  productName?: string
): Promise<string> {
  if (/^[0-9a-fA-F]{24}$/.test(cartProductId)) {
    return cartProductId;
  }

  if (backendProductsCache.length === 0) {
    try {
      backendProductsCache = await fetchProducts();
    } catch {
      // ignore
    }
  }

  if (productName && backendProductsCache.length > 0) {
    const match = backendProductsCache.find(
      (p) => p.name?.toLowerCase().trim() === productName?.toLowerCase().trim()
    );
    if (match?.id) return String(match.id);
  }

  if (backendProductsCache.length > 0 && backendProductsCache[0]?.id) {
    return String(backendProductsCache[0].id);
  }

  return cartProductId;
}

