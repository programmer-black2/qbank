"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthorLayout from "@/components/layout/AuthorLayout";
import { questionService } from "@/services/question/question.service";
import type { AuthorDashboardResponse } from "@/services/question/question.api";

const emptyDashboard: AuthorDashboardResponse = {
  stats: {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  },
  notifications: [],
};

const statusLabels: Record<string, string> = {
  pending: "در انتظار تایید",
  approved: "تایید شده",
  rejected: "رد شده",
};

export default function AuthorDashboardPage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<AuthorDashboardResponse>(emptyDashboard);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const data = await questionService.getAuthorDashboard();
      setDashboard(data);
    } catch (error) {
      const status = (error as { response?: { status?: number } }).response?.status;

      if (status === 401 || status === 403) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("user");
        router.replace("/author/login");
        return;
      }

      console.error("Error loading author dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const timeoutId = window.setTimeout(loadDashboard, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadDashboard]);

  return (
    <AuthorLayout title="داشبورد نویسنده">
      <section className="mb-8 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-white">
        <div className="max-w-2xl">
          <h2 className="mb-2 text-3xl font-bold">به پنل نویسنده خوش آمدید</h2>
          <p className="text-lg leading-8 text-blue-100">
            از این بخش می‌توانید سوال ثبت کنید، وضعیت بررسی سوال‌های خودتان را ببینید و بازخورد ادمین را پیگیری کنید.
          </p>
        </div>
      </section>

      <section className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="کل سوالات طرح‌شده"
          value={dashboard.stats.total}
          color="blue"
          loading={loading}
        />
        <StatCard
          label="در انتظار تایید"
          value={dashboard.stats.pending}
          color="amber"
          loading={loading}
        />
        <StatCard
          label="تایید شده"
          value={dashboard.stats.approved}
          color="green"
          loading={loading}
        />
        <StatCard
          label="رد شده"
          value={dashboard.stats.rejected}
          color="rose"
          loading={loading}
        />
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_420px]">
        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <h3 className="mb-6 text-xl font-bold text-gray-900">عملیات سریع</h3>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <button
              onClick={() => router.push("/author/questions/new")}
              className="group rounded-xl border border-blue-200 bg-blue-50 p-6 text-right transition-colors hover:border-blue-300 hover:bg-blue-100"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500 text-white transition-colors group-hover:bg-blue-600">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
              <h4 className="mb-2 text-lg font-semibold text-gray-900">ثبت سوال جدید</h4>
              <p className="text-sm leading-6 text-gray-600">سوال تازه بعد از ثبت برای بررسی ادمین ارسال می‌شود.</p>
            </button>

            <button
              onClick={() => router.push("/author/questions")}
              className="group rounded-xl border border-purple-200 bg-purple-50 p-6 text-right transition-colors hover:border-purple-300 hover:bg-purple-100"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500 text-white transition-colors group-hover:bg-purple-600">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6M7 4h10a2 2 0 012 2v14l-4-2-4 2-4-2-4 2V6a2 2 0 012-2z" />
                  </svg>
                </div>
                <svg className="h-5 w-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
              <h4 className="mb-2 text-lg font-semibold text-gray-900">سوالات من</h4>
              <p className="text-sm leading-6 text-gray-600">سوال‌ها را بر اساس وضعیت تایید، رد یا انتظار فیلتر کنید.</p>
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-gray-900">اعلان‌های بررسی</h3>
              <p className="mt-1 text-sm text-gray-500">آخرین تایید یا رد سوال‌ها توسط ادمین</p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
              {dashboard.notifications.length}
            </span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="h-20 animate-pulse rounded-xl bg-gray-100" />
              ))}
            </div>
          ) : dashboard.notifications.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm font-medium text-gray-500">
              هنوز اعلان جدیدی برای تایید یا رد سوال ندارید.
            </div>
          ) : (
            <div className="space-y-3">
              {dashboard.notifications.map((item) => (
                <button
                  key={item.id}
                  onClick={() => router.push("/author/questions")}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 text-right transition-colors hover:border-blue-200 hover:bg-blue-50"
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                      item.status_code === "approved"
                        ? "bg-green-100 text-green-700"
                        : "bg-rose-100 text-rose-700"
                    }`}>
                      {statusLabels[item.status_code] || item.status_name}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(item.changed_at).toLocaleString("fa-IR")}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-sm font-bold text-gray-900">
                    سوال #{item.question_id}: {item.question_text}
                  </p>
                  {item.note && (
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-600">
                      {item.note}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </AuthorLayout>
  );
}

function StatCard({
  label,
  value,
  color,
  loading,
}: {
  label: string;
  value: number;
  color: "blue" | "amber" | "green" | "rose";
  loading: boolean;
}) {
  const colors = {
    blue: "bg-blue-100 text-blue-600",
    amber: "bg-amber-100 text-amber-600",
    green: "bg-green-100 text-green-600",
    rose: "bg-rose-100 text-rose-600",
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="mb-1 text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">
            {loading ? "..." : value}
          </p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${colors[color]}`}>
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
