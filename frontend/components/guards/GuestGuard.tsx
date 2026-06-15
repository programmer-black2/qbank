"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type GuestGuardProps = {
  authenticatedPath?: string;
  children: React.ReactNode;
};

export default function GuestGuard({
  authenticatedPath = "/profile",
  children,
}: GuestGuardProps) {
  const router = useRouter();
  const [hasAccess] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return Boolean(localStorage.getItem("access"));
  });

  useEffect(() => {
    if (hasAccess) {
      router.replace(authenticatedPath);
    }
  }, [authenticatedPath, hasAccess, router]);

  if (hasAccess) {
    return null;
  }

  return <>{children}</>;
}
