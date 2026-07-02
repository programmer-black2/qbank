"use client";

import { Suspense } from "react";
import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import QuestionManagementPanel from "@/components/admin/QuestionManagementPanel";
import { getCurrentUser } from "@/services/auth/auth.api";

function AdminQuestionPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const initialWorkflowStatus = searchParams.get("workflow_status") || "";

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
      initialWorkflowStatus={initialWorkflowStatus}
    />
  );
}

export default function AdminQuestionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <AdminQuestionPageContent />
    </Suspense>
  );
}
