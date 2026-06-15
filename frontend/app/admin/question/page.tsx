"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QuestionManagementPanel from "@/components/admin/QuestionManagementPanel";
import { getCurrentUser } from "@/services/auth/auth.api";

export default function AdminQuestionPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuth = useCallback(async () => {
    try {
      await getCurrentUser();
      setIsAuthenticated(true);
    } catch {
      router.push("/admin/login");
    }
  }, [router]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      checkAuth();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [checkAuth]);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <QuestionManagementPanel
      title="مدیریت سوالات"
      subtitle="جستجو، فیلتر، ثبت و بررسی سوالات بانک سوال"
      backHref="/admin/dashboard"
    />
  );
}
