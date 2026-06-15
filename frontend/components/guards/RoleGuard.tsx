"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

export default function RoleGuard({
  allowedRoles,
  loginPath,
  children,
}: RoleGuardProps) {
  const router = useRouter();
  const [authState] = useState(() => {
    if (typeof window === "undefined") {
      return { hasAccess: false, role: undefined as string | undefined };
    }

    return {
      hasAccess: Boolean(localStorage.getItem("access")),
      role: getStoredRole(),
    };
  });

  useEffect(() => {
    if (!authState.hasAccess) {
      router.replace(loginPath);
      return;
    }

    if (!authState.role || !allowedRoles.includes(authState.role)) {
      router.replace("/");
    }
  }, [allowedRoles, authState.hasAccess, authState.role, loginPath, router]);

  if (!authState.hasAccess || !authState.role || !allowedRoles.includes(authState.role)) {
    return null;
  }

  return <>{children}</>;
}
