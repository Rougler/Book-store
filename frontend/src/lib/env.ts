const DEFAULT_API_BASE_URL = "http://localhost:8000";

export const getApiBaseUrl = () => {
  if (typeof process !== "undefined") {
    return process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;
  }

  return DEFAULT_API_BASE_URL;
};

