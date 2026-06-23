export type StoredUser = {
  id?: number;
  full_name?: string;
  phone?: string;
  role?: string;
  role_name?: string;
};

const decodeJwtPayload = (token: string): { exp?: number } | null => {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
      "="
    );

    return JSON.parse(window.atob(paddedPayload));
  } catch {
    return null;
  }
};

export const isTokenExpired = (token: string | null) => {
  if (!token) return true;

  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return false;

  return payload.exp * 1000 <= Date.now();
};

export const isExamPath = (pathname: string) =>
  pathname === "/exam" || pathname.startsWith("/exam/");

export const clearStoredAuth = () => {
  if (typeof window === "undefined") return;

  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("user");
  window.dispatchEvent(new Event("auth-changed"));
};

export const getStoredUser = (): StoredUser | null => {
  if (typeof window === "undefined") return null;

  try {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
};

export const hasValidAuthSession = () => {
  if (typeof window === "undefined") return false;

  const access = localStorage.getItem("access");
  const refresh = localStorage.getItem("refresh");

  return Boolean(access && refresh && !isTokenExpired(refresh));
};
