import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const API_BASE = 'https://ecommerse.lumina360.tech';
const TENANT = 'cyden-distributors';

const ADMIN_EMAIL = process.env.CYDEN_ADMIN_EMAIL || 'admin@cydendistributors.co.ke';
const ADMIN_PASSWORD = process.env.CYDEN_ADMIN_PASSWORD || 'Cyden@Admin2026!';
const CUSTOMER_EMAIL = process.env.CYDEN_CUSTOMER_EMAIL || 'orders@cydendistributors.co.ke';
const CUSTOMER_PASSWORD = process.env.CYDEN_CUSTOMER_PASSWORD || 'Cyden@Customer2026!';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_PATH = path.resolve(__dirname, '../src/data/catalog-cache.json');

interface CacheProduct {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: string;
  subcategory?: string;
  origin?: string;
  abv?: number;
  volumeMl?: number;
  casePack?: number;
  bottlePriceKes?: number;
  retailerRrpKes?: number;
  casePriceKes?: number;
  inStock?: boolean;
  stockCases?: number;
  kraStampVerified?: boolean;
  image?: string;
  description?: string;
  featured?: boolean;
}

async function api<T>(
  path: string,
  options: { method?: string; body?: unknown; token?: string | null } = {}
): Promise<T> {
  const { method = 'GET', body, token } = options;
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'x-tenant-id': TENANT,
  };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const raw = await res.text();
  let data: unknown = null;
  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = raw;
    }
  }

  if (!res.ok) {
    const message =
      data && typeof data === 'object' && 'message' in data
        ? String((data as { message: unknown }).message)
        : `HTTP ${res.status}`;
    throw new Error(`${method} ${path} -> ${message}`);
  }
  return data as T;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ensureUser(payload: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: string;
}): Promise<{ token: string; user: { _id?: string; id?: string; tenantId?: string; email: string } }> {
  try {
    const signup = await api<{
      access_token?: string;
      accessToken?: string;
      user?: { _id?: string; id?: string; tenantId?: string; email: string };
    }>('/auth/signup', { method: 'POST', body: payload });
    const token = String(signup.access_token ?? signup.accessToken ?? '');
    return { token, user: signup.user ?? { email: payload.email } };
  } catch {
    const login = await api<{
      access_token?: string;
      accessToken?: string;
      user?: { _id?: string; id?: string; tenantId?: string; email: string };
    }>('/auth/login', { method: 'POST', body: { email: payload.email, password: payload.password } });
    const token = String(login.access_token ?? login.accessToken ?? '');
    return { token, user: login.user ?? { email: payload.email } };
  }
}

async function main() {
  if (!fs.existsSync(CACHE_PATH)) {
    console.error(`Cache file not found at ${CACHE_PATH}`);
    process.exit(1);
  }

  const cache: { products: CacheProduct[] } = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
  const products = cache.products;
  console.log(`Loaded ${products.length} products from Cyden outlet cache.`);

  // 1. Register / verify admin account
  const admin = await ensureUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    firstName: 'Cyden',
    lastName: 'Admin',
    phoneNumber: '+254722839248',
    role: 'admin',
  });
  console.log(`Admin ready: ${admin.user.email} (tenant ${admin.user.tenantId ?? TENANT})`);
  const token = admin.token;

  // 2. Register / verify retail/wholesale customer account
  const customer = await ensureUser({
    email: CUSTOMER_EMAIL,
    password: CUSTOMER_PASSWORD,
    firstName: 'Cyden',
    lastName: 'Customer',
    phoneNumber: '+254700123456',
    role: 'customer',
  });
  console.log(`Customer ready: ${customer.user.email} (tenant ${customer.user.tenantId ?? TENANT})`);

  // 3. Create or load categories
  const categoryNames = [
    { name: 'Whiskey', key: 'whiskey', description: 'Scotch, Irish, bourbon and single malt whiskies' },
    { name: 'Gin', key: 'gin', description: 'London dry, botanical, and flavoured gins' },
    { name: 'Vodka', key: 'vodka', description: 'Pure grain and premium flavoured vodkas' },
    { name: 'Rum', key: 'rum', description: 'White, spiced, golden, and dark aged rums' },
    { name: 'Brandy & Cognac', key: 'brandy', description: 'Fine brandies and VS/VSOP cognacs' },
    { name: 'Liqueur', key: 'liqueur', description: 'Cream, coffee, herbal, and fruit liqueurs' },
    { name: 'Spirits', key: 'spirits', description: 'Premium spirits and specialities' },
    { name: 'Beer & Cider', key: 'beer_cider', description: 'Lagers, draughts, craft stouts, and ciders' },
    { name: 'Wine', key: 'wine', description: 'Red, white, and rosé imported wines' },
    { name: 'Champagne', key: 'champagne', description: 'Champagnes and sparkling celebration wines' },
  ];

  const existingCategories = await api<Array<{ _id?: string; id?: string; name: string }>>('/categories');
  const categoryIdByName = new Map<string, string>();
  for (const c of existingCategories) {
    categoryIdByName.set(c.name.toLowerCase(), String(c._id ?? c.id ?? ''));
  }

  const keyToId = new Map<string, string>();
  for (const cat of categoryNames) {
    let id = categoryIdByName.get(cat.name.toLowerCase());
    if (!id) {
      const created = await api<{ _id?: string; id?: string }>('/categories', {
        method: 'POST',
        body: { name: cat.name, description: cat.description, isActive: true },
        token,
      });
      id = String(created._id ?? created.id ?? '');
      console.log(`  + Created category: ${cat.name} (${id})`);
      await sleep(150);
    } else {
      console.log(`  = Category exists: ${cat.name} (${id})`);
    }
    keyToId.set(cat.key, id);
  }

  // 4. Create products
  const existingProducts = await api<Array<{ id?: string; _id?: string; name: string }>>('/products');
  const existingNames = new Set(existingProducts.map((p) => p.name.trim().toLowerCase()));

  let createdCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  for (const p of products) {
    const normalizedName = p.name.trim().toLowerCase();
    if (existingNames.has(normalizedName)) {
      skippedCount += 1;
      continue;
    }

    const categoryId = keyToId.get(p.category) ?? keyToId.get('spirits') ?? '';
    const price = Number(p.bottlePriceKes) || 0;
    const stockQuantity = Number(p.stockCases) || (p.inStock ? 25 : 10);

    const payload = {
      name: p.name,
      description: p.description || `${p.name} — genuine wholesale beverage supply from Cyden Distributors.`,
      price,
      categories: categoryId ? [categoryId] : [],
      images: p.image ? [p.image] : [],
      variants: [
        {
          name: `${p.volumeMl ?? 750}ml`,
          sku: p.sku || `CYD-${p.category.toUpperCase()}-${Date.now()}`,
          price,
          stockQuantity,
          attributes: {
            volumeMl: p.volumeMl ?? 750,
            casePack: p.casePack ?? 12,
          },
        },
      ],
      isActive: true,
      featured: Boolean(p.featured),
      brand: p.brand || 'Cyden Select',
      specifications: {
        category: p.category,
        origin: p.origin || 'Imported',
        abv: p.abv ?? null,
        volumeMl: p.volumeMl ?? 750,
        casePack: p.casePack ?? 12,
        kraStampVerified: Boolean(p.kraStampVerified),
      },
    };

    try {
      await api<{ id?: string; _id?: string }>('/products', {
        method: 'POST',
        body: payload,
        token,
      });
      createdCount += 1;
      existingNames.add(normalizedName);
      if (createdCount % 20 === 0) {
        console.log(`  ... ${createdCount} products created so far`);
      }
      await sleep(100);
    } catch (err) {
      failedCount += 1;
      console.error(`  x Failed: ${p.name} -> ${err instanceof Error ? err.message : err}`);
      await sleep(250);
    }
  }

  console.log('\n=== CYDEN SEED COMPLETE ===');
  console.log(`Products: ${createdCount} created, ${skippedCount} already existed, ${failedCount} failed`);
  console.log(`Tenant: ${TENANT}`);
  console.log(`Admin user: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log(`Customer user: ${CUSTOMER_EMAIL} / ${CUSTOMER_PASSWORD}`);
}

main().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});
