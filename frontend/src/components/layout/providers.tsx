"use client";

import { AdminProvider, AuthProvider } from "@/context/auth-context";

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <AdminProvider>{children}</AdminProvider>
    </AuthProvider>
  );
};

