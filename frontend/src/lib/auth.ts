import { apiRequest, userTokenStore, adminTokenStore } from "@/lib/api-client";
import { Tokens, UserProfile } from "@/lib/types";

export const storeUserTokens = (tokens: Tokens) => {
  userTokenStore.setTokens(tokens);
};

export const clearUserTokens = () => {
  userTokenStore.clearTokens();
};

export const getCurrentUser = async (): Promise<UserProfile | null> => {
  try {
    return await apiRequest<UserProfile>("/api/auth/me", {
      requireAuth: true,
      role: "user",
    });
  } catch (error) {
    // Silently handle authentication errors (expected when user is not logged in)
    if (error instanceof Error && error.message === "Authentication required") {
      return null;
    }
    // Only log unexpected errors
    console.warn("Unable to fetch current user", error);
    return null;
  }
};

export const storeAdminTokens = (tokens: Tokens) => {
  adminTokenStore.setTokens(tokens);
};

export const clearAdminTokens = () => {
  adminTokenStore.clearTokens();
};

