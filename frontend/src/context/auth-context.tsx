"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import {
  clearAdminTokens,
  clearUserTokens,
  getCurrentUser,
  storeAdminTokens,
  storeUserTokens,
} from "@/lib/auth";
import { Tokens, UserProfile } from "@/lib/types";

type AuthContextValue = {
  user: UserProfile | null;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
  login: (tokens: Tokens, profile: UserProfile) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const profile = await getCurrentUser();
      setUser(profile);
      setIsLoading(false);
    };

    load();
  }, []);

  useEffect(() => {
    const handleLogout = (event: Event) => {
      const customEvent = event as CustomEvent<{ role?: string }>;
      // Only logout if it's for user role or no role specified
      if (!customEvent.detail?.role || customEvent.detail.role === "user") {
        clearUserTokens();
        setUser(null);
      }
    };

    window.addEventListener("auth-logout", handleLogout);
    return () => {
      window.removeEventListener("auth-logout", handleLogout);
    };
  }, []);

  const refreshProfile = useCallback(async () => {
    setIsLoading(true);
    const profile = await getCurrentUser();
    setUser(profile);
    setIsLoading(false);
  }, []);

  const login = useCallback((tokens: Tokens, profile: UserProfile) => {
    storeUserTokens(tokens);
    setUser(profile);
  }, []);

  const logout = useCallback(() => {
    clearUserTokens();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, refreshProfile, login, logout }),
    [user, isLoading, refreshProfile, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

type AdminContextValue = {
  isAuthenticated: boolean;
  authenticate: (tokens: Tokens) => void;
  logout: () => void;
};

const AdminContext = createContext<AdminContextValue | undefined>(undefined);

export const AdminProvider = ({ children }: { children: React.ReactNode }) => {
  // Always start with false to avoid hydration mismatch
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Check authentication only on client side after mount
    if (typeof window !== "undefined") {
      setIsAuthenticated(Boolean(window.localStorage.getItem("bookstore-admin-tokens")));
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    const handleLogout = (event: Event) => {
      const customEvent = event as CustomEvent<{ role?: string }>;
      // Only logout if it's for admin role or no role specified
      if (!customEvent.detail?.role || customEvent.detail.role === "admin") {
        clearAdminTokens();
        setIsAuthenticated(false);
      }
    };

    window.addEventListener("auth-logout", handleLogout);
    return () => {
      window.removeEventListener("auth-logout", handleLogout);
    };
  }, []);

  const authenticate = useCallback((tokens: Tokens) => {
    storeAdminTokens(tokens);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    clearAdminTokens();
    setIsAuthenticated(false);
  }, []);

  const value = useMemo(
    () => ({ isAuthenticated, authenticate, logout }),
    [isAuthenticated, authenticate, logout],
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export const useAdminAuth = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within AdminProvider");
  }
  return context;
};

