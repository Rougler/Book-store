"use client";

import { AdminProvider, AuthProvider } from "@/context/auth-context";
import { ThemeProvider } from "@/context/theme-context";

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AdminProvider>{children}</AdminProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};
