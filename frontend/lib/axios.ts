import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

export type PublicRequestConfig = {
  _skipAuth?: boolean;
};

interface RetryableRequestConfig extends InternalAxiosRequestConfig, PublicRequestConfig {
  _retry?: boolean;
}

interface RefreshTokenResponse {
  access: string;
  refresh?: string;
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshTokenRequest: Promise<string> | null = null;

const clearAuthAndRedirect = () => {
  if (typeof window === "undefined") return;

  const currentPath = window.location.pathname;
  const isAdminPath = currentPath.startsWith("/admin");
  const isAuthorPath = currentPath.startsWith("/author");
  const loginPath = isAdminPath ? "/admin/login" : isAuthorPath ? "/author/login" : "/login";

  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("user");

  if (currentPath !== loginPath) {
    const next = `${currentPath}${window.location.search}`;
    window.location.href = `${loginPath}?next=${encodeURIComponent(next)}`;
  }
};

const requestNewAccessToken = async () => {
  if (typeof window === "undefined") {
    throw new Error("Cannot refresh token outside browser");
  }

  const refresh = localStorage.getItem("refresh");
  if (!refresh) {
    throw new Error("Refresh token is missing");
  }

  const response = await axios.post<RefreshTokenResponse>(
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/auth/refresh/`,
    { refresh },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  localStorage.setItem("access", response.data.access);

  if (response.data.refresh) {
    localStorage.setItem("refresh", response.data.refresh);
  }

  return response.data.access;
};

api.interceptors.request.use((config) => {
  const requestConfig = config as RetryableRequestConfig;

  if (typeof window !== "undefined" && !requestConfig._skipAuth) {
    const access = localStorage.getItem("access");

    if (access) {
      requestConfig.headers.Authorization = `Bearer ${access}`;
    }
  }

  return requestConfig;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const requestUrl = originalRequest?.url || "";
    const isRefreshRequest = requestUrl.includes("/api/auth/refresh/");

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      originalRequest._skipAuth ||
      isRefreshRequest
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      refreshTokenRequest ??= requestNewAccessToken().finally(() => {
        refreshTokenRequest = null;
      });

      const access = await refreshTokenRequest;
      originalRequest.headers.Authorization = `Bearer ${access}`;

      return api(originalRequest);
    } catch (refreshError) {
      clearAuthAndRedirect();
      return Promise.reject(refreshError);
    }
  }
);

export default api;
