import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import {
  AuthUser,
  SignupPayload,
  LoginPayload,
  loginUser,
  signupUser,
  logoutUser,
  fetchMe,
  refreshAccessToken,
  getAccessToken,
  getStoredUser,
  clearTokens,
} from '../services/authService';
import { migrateGuestOrders } from '../services/orderStore';

const userIdOf = (user: AuthUser | null): string | null => {
  const id = user?._id ?? user?.id;
  return id ? String(id) : null;
};

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<boolean>;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const [isInitializing, setIsInitializing] = useState(true);
  const restoringRef = useRef(false);

  const restoreSession = useCallback(async () => {
    if (restoringRef.current) return;
    restoringRef.current = true;
    try {
      if (!getAccessToken()) {
        setIsInitializing(false);
        return;
      }
      const me = await fetchMe();
      setUser(me);
      const uid = userIdOf(me);
      if (uid) migrateGuestOrders(uid);
    } catch {
      // Try refresh
      try {
        await refreshAccessToken();
        const me = await fetchMe();
        setUser(me);
        const uid = userIdOf(me);
        if (uid) migrateGuestOrders(uid);
      } catch {
        clearTokens();
        setUser(null);
      }
    } finally {
      restoringRef.current = false;
      setIsInitializing(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const login = useCallback(async (payload: LoginPayload) => {
    const result = await loginUser(payload);
    const me = result.user ?? (await fetchMe());
    setUser(me);
    const uid = userIdOf(me);
    if (uid) migrateGuestOrders(uid);
  }, []);

  const signup = useCallback(async (payload: SignupPayload) => {
    const result = await signupUser(payload);
    if (result.accessToken) {
      const me = result.user ?? (await fetchMe());
      setUser(me);
      const uid = userIdOf(me);
      if (uid) migrateGuestOrders(uid);
      return;
    }
    const loginResult = await loginUser({ email: payload.email, password: payload.password });
    const me = loginResult.user ?? (await fetchMe());
    setUser(me);
    const uid = userIdOf(me);
    if (uid) migrateGuestOrders(uid);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } finally {
      setUser(null);
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const result = await refreshAccessToken();
      setUser(result.user ?? (await fetchMe()));
      return true;
    } catch {
      clearTokens();
      setUser(null);
      return false;
    }
  }, []);

  const getToken = useCallback(() => getAccessToken(), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isInitializing,
        login,
        signup,
        logout,
        refresh,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
