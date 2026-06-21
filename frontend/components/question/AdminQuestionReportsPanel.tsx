"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AdminHeader from "@/components/ui/AdminHeader";
import {
  getQuestionReports,
  QuestionReport,
  updateQuestionReportStatus,
} from "@/services/question/question.api";

type ReportStatusFilter = "" | "pending" | "resolved";

const getErrorMessage = (error: unknown, fallback = "خطا در دریافت اطلاعات گزارش‌ها") => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const data = (error as { response?: { data?: unknown } }).response?.data;

    if (typeof data === "string") return data;
    if (typeof data === "object" && data !== null) {
      const record = data as Record<string, unknown>;
      const firstValue = Object.values(record)[0];

      if (Array.isArray(firstValue)) return String(firstValue[0]);
      if (typeof firstValue === "string") return firstValue;
      if (typeof record.message === "string") return record.message;
      if (typeof record.error === "string") return record.error;
      if (typeof record.detail === "string") return record.detail;
    }
  }

  return fallback;
};

const formatDate = (value?: string) => {
  if (!value) return "-";

  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

const getStatusLabel = (status: QuestionReport["status"]) => {
  return status === "resolved" ? "رسیدگی شده" : "در انتظار";
};

const getStatusClass = (status: QuestionReport["status"]) => {
  return status === "resolved"
    ? "bg-green-100 text-green-700"
    : "bg-amber-100 text-amber-700";
};

const getQuestionTypeLabel = (type: QuestionReport["question_type"]) => {
  if (type === "mcq") return "تستی";
  if (type === "descriptive") return "تشریحی";
  return type || "-";
};

const getDifficultyLabel = (difficulty: QuestionReport["difficulty"]) => {
  if (difficulty === "easy") return "آسان";
  if (difficulty === "medium") return "متوسط";
  if (difficulty === "hard") return "سخت";
  if (difficulty === "unknown") return "نامشخص";
  return difficulty || "-";
};

export default function AdminQuestionReportsPanel() {
  const router = useRouter();
  const [reports, setReports] = useState<QuestionReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<QuestionReport | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReportStatusFilter>("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getQuestionReports({
        search: searchTerm || undefined,
        status: statusFilter || undefined,
        ordering: "-created_at",
      });

      setReports(data);
      setSelectedReport((current) => {
        if (!current) return data[0] || null;
        return data.find((report) => report.id === current.id) || data[0] || null;
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    const timeoutId = window.setTimeout(loadReports, 250);
    return () => window.clearTimeout(timeoutId);
  }, [loadReports]);

  const stats = useMemo(() => {
    const pending = reports.filter((report) => report.status === "pending").length;
    const resolved = reports.filter((report) => report.status === "resolved").length;

    return {
      total: reports.length,
      pending,
      resolved,
    };
  }, [reports]);

  const handleStatusChange = async (report: QuestionReport, status: QuestionReport["status"]) => {
    if (report.status === status) return;

    try {
      setSavingId(report.id);
      setError("");
      const updatedReport = await updateQuestionReportStatus(report.id, status);

      setReports((currentReports) =>
        currentReports.map((item) => (item.id === report.id ? updatedReport : item))
      );
      setSelectedReport((current) => (current?.id === report.id ? updatedReport : current));
    } catch (err) {
      setError(getErrorMessage(err, "خطا در تغییر وضعیت گزارش"));
    } finally {
      setSavingId(null);
    }
  };

  const openQuestion = (questionId: number) => {
    router.push(`/admin/question?search=${questionId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-right">
      <AdminHeader
        title="گزارش کاربران برای سوالات"
        subtitle="گزارش‌های ثبت‌شده توسط کاربران را بررسی و وضعیت رسیدگی را مدیریت کنید"
        backHref="/admin/dashboard"
        backLabel="بازگشت به داشبورد"
        variant="red"
      />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold text-gray-500">کل گزارش‌ها</p>
            <p className="mt-2 text-2xl font-black text-gray-900">{stats.total}</p>
          </div>
          <div className="rounded-lg border border-amber-100 bg-amber-50 p-4">
            <p className="text-xs font-bold text-amber-700">در انتظار رسیدگی</p>
            <p className="mt-2 text-2xl font-black text-amber-800">{stats.pending}</p>
          </div>
          <div className="rounded-lg border border-green-100 bg-green-50 p-4">
            <p className="text-xs font-bold text-green-700">رسیدگی شده</p>
            <p className="mt-2 text-2xl font-black text-green-800">{stats.resolved}</p>
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-gray-200 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">لیست گزارش‌ها</h2>
                <p className="text-sm text-gray-500">{reports.length} گزارش در این فیلتر</p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-red-500 sm:w-72"
                  placeholder="جستجو در متن گزارش، کاربر یا سوال"
                />
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as ReportStatusFilter)}
                  className="rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-red-500"
                >
                  <option value="">همه وضعیت‌ها</option>
                  <option value="pending">در انتظار</option>
                  <option value="resolved">رسیدگی شده</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="p-8 text-center text-sm font-medium text-gray-500">در حال بارگذاری...</div>
            ) : reports.length === 0 ? (
              <div className="p-8 text-center text-sm font-medium text-gray-500">گزارشی یافت نشد.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-5 py-3 text-right text-xs font-bold text-gray-500">کاربر</th>
                      <th className="px-5 py-3 text-right text-xs font-bold text-gray-500">سوال</th>
                      <th className="px-5 py-3 text-right text-xs font-bold text-gray-500">گزارش</th>
                      <th className="px-5 py-3 text-right text-xs font-bold text-gray-500">وضعیت</th>
                      <th className="px-5 py-3 text-right text-xs font-bold text-gray-500">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {reports.map((report) => {
                      const isSaving = savingId === report.id;
                      const isSelected = selectedReport?.id === report.id;

                      return (
                        <tr
                          key={report.id}
                          className={`${isSelected ? "bg-red-50/60" : "hover:bg-gray-50"}`}
                        >
                          <td className="px-5 py-4">
                            <div className="text-sm font-bold text-gray-900">{report.user_name || "کاربر"}</div>
                            <div className="text-xs text-gray-500" dir="ltr">{report.user_phone || "-"}</div>
                          </td>
                          <td className="px-5 py-4">
                            <button
                              type="button"
                              onClick={() => openQuestion(report.question_id)}
                              className="text-sm font-bold text-blue-600 hover:text-blue-800"
                            >
                              سوال #{report.question_id}
                            </button>
                            <div className="mt-1 line-clamp-2 max-w-xs text-xs leading-5 text-gray-500">
                              {report.question_text}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="line-clamp-2 max-w-xs text-sm leading-6 text-gray-700">{report.message}</div>
                            <div className="mt-1 text-xs text-gray-400">{formatDate(report.created_at)}</div>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${getStatusClass(report.status)}`}>
                              {getStatusLabel(report.status)}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex flex-wrap items-center gap-3">
                              <button
                                type="button"
                                onClick={() => setSelectedReport(report)}
                                className="text-sm font-bold text-gray-600 hover:text-gray-900"
                              >
                                جزئیات
                              </button>
                              <button
                                type="button"
                                disabled={isSaving}
                                onClick={() =>
                                  handleStatusChange(
                                    report,
                                    report.status === "pending" ? "resolved" : "pending"
                                  )
                                }
                                className="text-sm font-bold text-red-600 hover:text-red-800 disabled:opacity-50"
                              >
                                {report.status === "pending" ? "رسیدگی شد" : "بازگردانی"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <aside className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            {selectedReport ? (
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">جزئیات گزارش #{selectedReport.id}</h2>
                    <p className="mt-1 text-xs font-bold text-gray-500">{formatDate(selectedReport.created_at)}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${getStatusClass(selectedReport.status)}`}>
                    {getStatusLabel(selectedReport.status)}
                  </span>
                </div>

                <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                  <p className="mb-2 text-xs font-bold text-gray-500">متن گزارش کاربر</p>
                  <p className="whitespace-pre-wrap text-sm font-medium leading-7 text-gray-800">
                    {selectedReport.message}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs font-bold text-gray-500">گزارش‌دهنده</p>
                  <div className="rounded-lg border border-gray-100 p-4">
                    <p className="text-sm font-bold text-gray-900">{selectedReport.user_name || "کاربر"}</p>
                    <p className="mt-1 text-xs text-gray-500" dir="ltr">{selectedReport.user_phone || "-"}</p>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-bold text-gray-500">سوال گزارش‌شده</p>
                  <div className="rounded-lg border border-gray-100 p-4">
                    <div className="mb-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                        {getQuestionTypeLabel(selectedReport.question_type)}
                      </span>
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-600">
                        {getDifficultyLabel(selectedReport.difficulty)}
                      </span>
                    </div>
                    <p className="line-clamp-6 text-sm font-medium leading-7 text-gray-800">
                      {selectedReport.question_text}
                    </p>
                    <button
                      type="button"
                      onClick={() => openQuestion(selectedReport.question_id)}
                      className="mt-4 rounded-lg border border-blue-200 px-4 py-2 text-sm font-bold text-blue-700 hover:bg-blue-50"
                    >
                      مشاهده در مدیریت سوالات
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={savingId === selectedReport.id || selectedReport.status === "resolved"}
                    onClick={() => handleStatusChange(selectedReport, "resolved")}
                    className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    رسیدگی شد
                  </button>
                  <button
                    type="button"
                    disabled={savingId === selectedReport.id || selectedReport.status === "pending"}
                    onClick={() => handleStatusChange(selectedReport, "pending")}
                    className="rounded-lg border border-amber-200 px-4 py-2.5 text-sm font-bold text-amber-700 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    بازگردانی
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center text-sm font-bold text-gray-500">
                برای دیدن جزئیات، یک گزارش را انتخاب کنید.
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
