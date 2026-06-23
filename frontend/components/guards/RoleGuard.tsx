"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { clearStoredAuth, hasValidAuthSession } from "@/lib/auth";

type RoleGuardProps = {
  allowedRoles: string[];
  loginPath: string;
  children: React.ReactNode;
};

const getStoredRole = () => {
  const storedUser = localStorage.getItem("user");

  if (!storedUser) {
    return undefined;
  }

  try {
    const user = JSON.parse(storedUser);
    return user?.role || user?.role_name;
  } catch {
    return undefined;
  }
};

const getAuthSnapshot = () => {
  if (typeof window === "undefined") {
    return "pending|";
  }

  const hasAccess = hasValidAuthSession() ? "1" : "0";
  return `${hasAccess}|${getStoredRole() || ""}`;
};

const getServerAuthSnapshot = () => "pending|";

const subscribeToAuthStorage = (callback: () => void) => {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleStorage = () => callback();
  window.addEventListener("storage", handleStorage);
  queueMicrotask(callback);

  return () => window.removeEventListener("storage", handleStorage);
};

export default function RoleGuard({
  allowedRoles,
  loginPath,
  children,
}: RoleGuardProps) {
  const router = useRouter();
  const authSnapshot = useSyncExternalStore(
    subscribeToAuthStorage,
    getAuthSnapshot,
    getServerAuthSnapshot,
  );
  const [accessValue, role] = authSnapshot.split("|");
  const checked = accessValue !== "pending";
  const hasAccess = accessValue === "1";

  useEffect(() => {
    if (!checked) {
      return;
    }

    if (!hasAccess) {
      clearStoredAuth();
      router.replace(loginPath);
      return;
    }

    if (!role || !allowedRoles.includes(role)) {
      router.replace("/");
    }
  }, [allowedRoles, checked, hasAccess, loginPath, role, router]);

  if (
    !checked ||
    !hasAccess ||
    !role ||
    !allowedRoles.includes(role)
  ) {
    return null;
  }

  return <>{children}</>;
}
