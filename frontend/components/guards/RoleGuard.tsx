"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { clearStoredAuth, hasValidAuthSession } from "@/lib/auth";
import { getCurrentUser } from "@/services/auth/auth.api";

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
  window.addEventListener("auth-changed", handleStorage);
  queueMicrotask(callback);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener("auth-changed", handleStorage);
  };
};

export default function RoleGuard({
  allowedRoles,
  loginPath,
  children,
}: RoleGuardProps) {
  const router = useRouter();
  const [verifiedAuthKey, setVerifiedAuthKey] = useState<string | null>(null);
  const authSnapshot = useSyncExternalStore(
    subscribeToAuthStorage,
    getAuthSnapshot,
    getServerAuthSnapshot,
  );
  const [accessValue, role] = authSnapshot.split("|");
  const checked = accessValue !== "pending";
  const hasAccess = accessValue === "1";
  const allowedRolesKey = useMemo(() => allowedRoles.join("|"), [allowedRoles]);
  const authKey = `${accessValue}|${role}|${allowedRolesKey}|${loginPath}`;

  useEffect(() => {
    let isActive = true;

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
      return;
    }

    const verifyCurrentUser = async () => {
      try {
        const user = await getCurrentUser();
        const verifiedRole = user?.role || user?.role_name;

        if (!verifiedRole || !allowedRoles.includes(verifiedRole)) {
          router.replace("/");
          return;
        }

        localStorage.setItem("user", JSON.stringify(user));

        if (isActive) {
          setVerifiedAuthKey(authKey);
        }
      } catch {
        clearStoredAuth();
        router.replace(loginPath);
      }
    };

    verifyCurrentUser();

    return () => {
      isActive = false;
    };
  }, [allowedRoles, allowedRolesKey, authKey, checked, hasAccess, loginPath, role, router]);

  if (
    !checked ||
    verifiedAuthKey !== authKey ||
    !hasAccess ||
    !role ||
    !allowedRoles.includes(role)
  ) {
    return null;
  }

  return <>{children}</>;
}
