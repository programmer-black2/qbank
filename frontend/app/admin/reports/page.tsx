"use client";

import AdminLayout from "@/components/layout/AdminLayout";
import AdminHeader from "@/components/ui/AdminHeader";

const reportCards = [
  {
    title: "گزارش نویسنده‌ها",
    description: "نمای کلی عملکرد و فعالیت نویسنده‌ها",
    color: "from-purple-50 to-purple-100 border-purple-200 text-purple-600 bg-purple-500",
  },
  {
    title: "گزارش‌های مالی",
    description: "گزارش درآمد، پرداخت‌ها و وضعیت مالی",
    color: "from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-600 bg-emerald-500",
  },
  {
    title: "گزارش آزمون‌ها",
    description: "آمار و وضعیت آزمون‌های برگزار شده",
    color: "from-blue-50 to-blue-100 border-blue-200 text-blue-600 bg-blue-500",
  },
  {
    title: "گزارش آزمون‌ها",
    description: "گزارش تکمیلی آزمون‌ها برای فازهای بعدی",
    color: "from-teal-50 to-teal-100 border-teal-200 text-teal-600 bg-teal-500",
  },
];

export default function AdminReportsPage() {
  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 text-right">
        <AdminHeader
          title="گزارش‌ها و آمار"
          subtitle="بخش‌های گزارش‌گیری ادمین برای فازهای بعدی آماده شده‌اند"
          backHref="/admin/dashboard"
          backLabel="بازگشت به داشبورد"
          variant="orange"
        />

        <main className="mx-auto max-w-7xl px-4 py-8">
          <div className="mb-8 rounded-lg border border-orange-100 bg-orange-50 p-5">
            <h2 className="text-lg font-black text-gray-900">مرکز گزارش‌ها</h2>
            <p className="mt-2 text-sm font-medium leading-7 text-gray-600">
              این کارت‌ها فعلاً غیرفعال هستند و در فازهای بعدی به گزارش‌های کامل متصل می‌شوند.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {reportCards.map((card, index) => {
              const colorClasses = card.color.split(" ");

              return (
                <div
                  key={`${card.title}-${index}`}
                  className={`group rounded-xl border bg-gradient-to-r ${colorClasses[0]} ${colorClasses[1]} ${colorClasses[2]} p-6 text-right opacity-60 cursor-not-allowed`}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${colorClasses[4]}`}>
                      <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 17v-6m4 6V7m4 10v-4m4 7H3M4 4h16v12H4V4z"
                        />
                      </svg>
                    </div>
                    <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-gray-500">
                      بزودی
                    </span>
                  </div>

                  <h3 className="mb-2 text-lg font-black text-gray-900">{card.title}</h3>
                  <p className="text-sm font-medium leading-6 text-gray-600">{card.description}</p>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </AdminLayout>
  );
}
