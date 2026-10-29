const isDevelopment =
  typeof import.meta !== 'undefined' && Boolean(import.meta.env?.DEV);

export const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
  (isDevelopment
    ? 'http://localhost:3000'
    : 'https://ecommerse.lumina360.tech');

export const GOOGLE_CLIENT_ID =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_CLIENT_ID) ||
  '';

export const DEFAULT_TENANT_ID = 'cyden-distributors';

export const API_ENDPOINTS = {
  // Auth
  signup: '/auth/signup',
  login: '/auth/login',
  google: '/auth/google',
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
