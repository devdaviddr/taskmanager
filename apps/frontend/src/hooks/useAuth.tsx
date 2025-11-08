import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import type { AxiosRequestConfig } from 'axios';
import api, { setRefreshTokenFunction } from '../services/api';

interface User {
  id: number;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  loading: boolean;
  refreshing: boolean;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const refreshPromiseRef = useRef<Promise<void> | null>(null);
  const requestQueueRef = useRef<Array<{resolve: (value: unknown) => void, reject: (reason: unknown) => void, config: AxiosRequestConfig}>>([]);
  const tokenExpiryRef = useRef<number | null>(null);
  const refreshTimerRef = useRef<number | null>(null);

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Set the refresh function for the API service
  useEffect(() => {
    setRefreshTokenFunction(refreshToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.user);
      // Set token expiry and schedule refresh on successful auth check
      tokenExpiryRef.current = Date.now() + (60 * 60 * 1000); // 1 hour from now
      scheduleRefresh();
    } catch {
      // If auth check fails, user is not authenticated
      setUser(null);
      tokenExpiryRef.current = null;
      clearRefreshTimer();
    } finally {
      // Always set loading to false, even on error
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    setUser(response.data.user);
    // Set token expiry and schedule refresh on login
    tokenExpiryRef.current = Date.now() + (60 * 60 * 1000); // 1 hour from now
    scheduleRefresh();
  };

  const register = async (email: string, password: string, name?: string) => {
    const response = await api.post('/auth/register', { email, password, name });
    setUser(response.data.user);
    // Set token expiry and schedule refresh on register
    tokenExpiryRef.current = Date.now() + (60 * 60 * 1000); // 1 hour from now
    scheduleRefresh();
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Ignore logout errors - user is being logged out anyway
      console.warn('Logout API call failed:', error);
    } finally {
      setUser(null);
      tokenExpiryRef.current = null;
      clearRefreshTimer();
      refreshPromiseRef.current = null;
      requestQueueRef.current = [];
    }
  };

  const refreshToken = async (): Promise<void> => {
    if (refreshPromiseRef.current) {
      // If refresh is already in progress, wait for it
      return refreshPromiseRef.current;
    }

    if (!user) {
      throw new Error('No user to refresh token for');
    }

    setRefreshing(true);
    refreshPromiseRef.current = (async () => {
      try {
        const response = await api.post('/auth/refresh');
        setUser(response.data.user);
        // Update token expiry (1 hour from now)
        tokenExpiryRef.current = Date.now() + (60 * 60 * 1000);
        scheduleRefresh();
      } catch (error) {
        console.error('Token refresh failed:', error);
        // Clear auth state on refresh failure
        setUser(null);
        tokenExpiryRef.current = null;
        clearRefreshTimer();
        throw error;
      } finally {
        setRefreshing(false);
        refreshPromiseRef.current = null;
        // Process queued requests
        processQueue();
      }
    })();

    return refreshPromiseRef.current;
  };

  const processQueue = () => {
    const queue = requestQueueRef.current;
    requestQueueRef.current = [];
    
    queue.forEach(({ resolve, reject, config }) => {
      api.request(config).then((response) => resolve(response)).catch((error) => reject(error));
    });
  };

  const scheduleRefresh = () => {
    clearRefreshTimer();
    if (tokenExpiryRef.current) {
      // Schedule refresh 5 minutes before expiry
      const refreshTime = tokenExpiryRef.current - (5 * 60 * 1000) - Date.now();
      if (refreshTime > 0) {
        refreshTimerRef.current = window.setTimeout(() => {
          refreshToken().catch(console.error);
        }, refreshTime);
      }
    }
  };

  const clearRefreshTimer = () => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  };

  // Set the refresh function for the API service
  useEffect(() => {
    setRefreshTokenFunction(refreshToken);
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    setUser,
    loading,
    refreshing,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};