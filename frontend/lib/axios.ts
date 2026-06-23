import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";
import { clearStoredAuth, isExamPath } from "@/lib/auth";

export type PublicRequestConfig = AxiosRequestConfig & {
  _skipAuth?: boolean;
};

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _skipAuth?: boolean;
  _retry?: boolean;
}

interface RefreshTokenResponse {
  access: string;
  refresh?: string;
}

const getApiBaseUrl = () => {
  const configuredUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8000";

  return configuredUrl.replace(/\/api\/?$/, "");
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
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

  clearStoredAuth();

  if (isExamPath(currentPath)) {
    return;
  }

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
    `${getApiBaseUrl()}/api/auth/refresh/`,
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
  const baseURL = requestConfig.baseURL || "";
  const requestUrl = requestConfig.url || "";

  if (/\/api\/?$/.test(baseURL) && requestUrl.startsWith("/api/")) {
    requestConfig.url = requestUrl.replace(/^\/api/, "");
  }

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
