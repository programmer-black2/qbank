"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { clearStoredAuth, hasValidAuthSession, isExamPath } from "@/lib/auth";

type AuthGuardProps = {
  children: React.ReactNode;
};

export default function AuthGuard({ children }: AuthGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const isAllowed = hasValidAuthSession();
      setHasAccess(isAllowed);
      setChecked(true);

      if (!isAllowed) {
        if (!isExamPath(pathname)) {
          clearStoredAuth();
        }

        const next = `${pathname}${window.location.search}`;
        router.replace(`/login?next=${encodeURIComponent(next)}`);
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [pathname, router]);

  if (!checked || !hasAccess) {
    return null;
  }

  return <>{children}</>;
}
