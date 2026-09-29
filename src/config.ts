export const API_BASE_URL = 'https://ecommerse.lumina360.tech';

export const DEFAULT_TENANT_ID = 'cyden-distributors';

export const API_ENDPOINTS = {
  // Auth
  signup: '/auth/signup',
  login: '/auth/login',
  refresh: '/auth/refresh',
  logout: '/auth/logout',
  me: '/users/me',
  users: '/users',

  // Products & Categories
  products: '/products',
  productsActive: '/products/active',
  productsFeatured: '/products/featured',
  categories: '/categories',
  categoriesActive: '/categories/active',

  // Orders
  orders: '/orders',

  // M-Pesa
  mpesaStkPush: '/mpesa/stk-push',
  mpesaCheck: '/mpesa/check',
  mpesaFindTransaction: '/mpesa/find-transaction',
} as const;
