import { apiRequest, ApiError } from './apiClient';
import { API_ENDPOINTS } from '../config';

const ACCESS_TOKEN_KEY = 'cyden_access_token';
const REFRESH_TOKEN_KEY = 'cyden_refresh_token';
const USER_KEY = 'cyden_auth_user';

export interface AuthUser {
  _id?: string;
  id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  phoneNumber?: string;
  role?: string;
  isActive?: boolean;
  addresses?: unknown[];
  tenantId?: string;
  [key: string]: unknown;
}

export interface SignupPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role?: 'admin' | 'customer' | 'staff';
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RefreshPayload {
  refreshToken: string;
}

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  user?: AuthUser;
}

const memoryTokens: { access?: string | null; refresh?: string | null; user?: AuthUser | null } = {};

export function getAccessToken(): string | null {
  try {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (stored) return stored;
    }
  } catch {
    // ignore
  }
  return memoryTokens.access || null;
}

export function getRefreshToken(): string | null {
  try {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (stored) return stored;
    }
  } catch {
    // ignore
  }
  return memoryTokens.refresh || null;
}

export function getStoredUser(): AuthUser | null {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(USER_KEY);
      if (raw) return JSON.parse(raw) as AuthUser;
    }
  } catch {
    // ignore
  }
  return memoryTokens.user || null;
}

export function storeSession(result: AuthResult): void {
  memoryTokens.access = result.accessToken;
  memoryTokens.refresh = result.refreshToken;
  if (result.user) memoryTokens.user = result.user;

  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(ACCESS_TOKEN_KEY, result.accessToken);
      if (result.refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, result.refreshToken);
      }
      if (result.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(result.user));
      }
    }
  } catch {
    // Storage unavailable
  }
}

export function clearTokens(): void {
  memoryTokens.access = null;
  memoryTokens.refresh = null;
  memoryTokens.user = null;

  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  } catch {
    // ignore
  }
}

function parseUser(user: unknown): AuthUser | undefined {
  if (user && typeof user === 'object') {
    return user as AuthUser;
  }
  return undefined;
}

function extractAuthResult(data: unknown, fallbackRefreshToken = ''): AuthResult {
  const obj = (data ?? {}) as Record<string, unknown>;
  const accessToken = obj.accessToken ?? obj.access_token ?? obj.token;
  const refreshToken = obj.refreshToken ?? obj.refresh_token ?? fallbackRefreshToken;

  if (typeof accessToken === 'string' && accessToken) {
    return {
      accessToken,
      refreshToken: typeof refreshToken === 'string' ? refreshToken : '',
      user: parseUser(obj.user),
    };
  }

  throw new Error('Unexpected response from server: tokens missing');
}

function userIdFromToken(token: string): string | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded?.sub || decoded?.userId || decoded?._id || null;
  } catch {
    return null;
  }
}

export async function signupUser(payload: SignupPayload): Promise<AuthResult> {
  const data = await apiRequest(API_ENDPOINTS.signup, {
    method: 'POST',
    body: payload,
  });
  const result = extractAuthResult(data);
  if (result.accessToken) {
    storeSession(result);
  }
  return result;
}

export async function loginUser(payload: LoginPayload): Promise<AuthResult> {
  const data = await apiRequest(API_ENDPOINTS.login, {
    method: 'POST',
    body: payload,
  });
  const result = extractAuthResult(data);
  storeSession(result);
  return result;
}

export async function refreshAccessToken(): Promise<AuthResult> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  const data = await apiRequest(API_ENDPOINTS.refresh, {
    method: 'POST',
    body: { refreshToken } satisfies RefreshPayload,
  });
  const result = extractAuthResult(data, refreshToken);
  storeSession({ ...result, refreshToken: result.refreshToken || refreshToken });
  return result;
}

export async function logoutUser(): Promise<void> {
  try {
    await apiRequest(API_ENDPOINTS.logout, { method: 'POST' });
  } catch {
    // Continue clearing even if server logout request fails
  } finally {
    clearTokens();
  }
}

export async function fetchMe(): Promise<AuthUser> {
  const token = getAccessToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  try {
    const me = await apiRequest<AuthUser>(API_ENDPOINTS.me, { token });
    if (me && me.email) {
      localStorage.setItem(USER_KEY, JSON.stringify(me));
      return me;
    }
  } catch (err) {
    if (!(err instanceof ApiError) || err.status !== 404) throw err;
  }

  const userId = userIdFromToken(token);
  if (userId) {
    try {
      const byId = await apiRequest<AuthUser>(`/users/${userId}`, { token });
      if (byId && byId.email) {
        localStorage.setItem(USER_KEY, JSON.stringify(byId));
        return byId;
      }
    } catch {
      // ignore
    }
  }

  const stored = getStoredUser();
  if (stored) return stored;

  throw new Error('Unable to load user profile');
}
