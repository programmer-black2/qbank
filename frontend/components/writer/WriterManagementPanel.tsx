"use client";

import { useCallback, useEffect, useState } from "react";
import AdminHeader from "@/components/ui/AdminHeader";
import {
  createWriter,
  deleteWriter,
  getWriters,
  updateWriter,
  WriterPayload,
  WriterUser,
} from "@/services/writer/writer.api";

const emptyForm: WriterPayload = {
  full_name: "",
  phone: "",
  password: "",
  is_active: true,
};

const getErrorMessage = (error: unknown) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const data = (error as { response?: { data?: unknown } }).response?.data;

    if (typeof data === "string") return data;
    if (typeof data === "object" && data !== null) {
      const record = data as Record<string, unknown>;
      const firstValue = Object.values(record)[0];

      if (Array.isArray(firstValue)) return String(firstValue[0]);
      if (typeof firstValue === "string") return firstValue;
      if (typeof record.error === "string") return record.error;
      if (typeof record.detail === "string") return record.detail;
    }
  }

  return "خطا در ذخیره اطلاعات نویسنده";
};

export default function WriterManagementPanel() {
  const [writers, setWriters] = useState<WriterUser[]>([]);
  const [form, setForm] = useState<WriterPayload>(emptyForm);
  const [editingWriter, setEditingWriter] = useState<WriterUser | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadWriters = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getWriters({ search: searchTerm || undefined });
      setWriters(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const timeoutId = window.setTimeout(loadWriters, 250);
    return () => window.clearTimeout(timeoutId);
  }, [loadWriters]);

  const resetForm = () => {
    setEditingWriter(null);
    setForm(emptyForm);
    setError("");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!editingWriter && !form.password) {
      setError("رمز عبور برای ثبت نویسنده الزامی است");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        ...form,
        password: form.password?.trim() || undefined,
      };

      if (editingWriter) {
        await updateWriter(editingWriter.id, payload);
      } else {
        await createWriter(payload);
      }

      resetForm();
      await loadWriters();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (writer: WriterUser) => {
    setEditingWriter(writer);
    setForm({
      full_name: writer.full_name,
      phone: writer.phone,
      password: "",
      is_active: writer.is_active,
    });
    setError("");
  };

  const handleDelete = async (writer: WriterUser) => {
    if (!window.confirm(`نویسنده ${writer.full_name} حذف شود؟`)) {
      return;
    }

    try {
      setError("");
      await deleteWriter(writer.id);
      await loadWriters();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-right">
      <AdminHeader
        title="مدیریت نویسنده‌ها"
        subtitle="ایجاد، مشاهده، ویرایش و حذف حساب‌های نویسنده"
        backHref="/admin/dashboard"
        backLabel="بازگشت به داشبورد"
      />

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[360px_1fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
        >
          <h2 className="mb-1 text-lg font-bold text-gray-900">
            {editingWriter ? "ویرایش نویسنده" : "ثبت نویسنده جدید"}
          </h2>
          <p className="mb-5 text-sm text-gray-500">
            نام، شماره موبایل و رمز عبور نویسنده را وارد کنید.
          </p>

          {error && (
            <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">نام نویسنده</span>
              <input
                value={form.full_name}
                onChange={(event) => setForm((prev) => ({ ...prev, full_name: event.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                required
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">شماره موبایل</span>
              <input
                value={form.phone}
                onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-left focus:border-transparent focus:ring-2 focus:ring-blue-500"
                dir="ltr"
                placeholder="09123456789"
                required
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">
                {editingWriter ? "رمز عبور جدید" : "رمز عبور"}
              </span>
              <input
                type="password"
                value={form.password || ""}
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-left focus:border-transparent focus:ring-2 focus:ring-blue-500"
                dir="ltr"
                minLength={8}
                required={!editingWriter}
              />
            </label>

            <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) => setForm((prev) => ({ ...prev, is_active: event.target.checked }))}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              حساب فعال باشد
            </label>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? "در حال ذخیره..." : editingWriter ? "ذخیره تغییرات" : "ثبت نویسنده"}
            </button>
            {editingWriter && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50"
              >
                انصراف
              </button>
            )}
          </div>
        </form>

        <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-gray-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">حساب‌های نویسنده</h2>
              <p className="text-sm text-gray-500">{writers.length} نویسنده</p>
            </div>
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 sm:max-w-xs"
              placeholder="جستجو بر اساس نام یا موبایل"
            />
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm font-medium text-gray-500">در حال بارگذاری...</div>
          ) : writers.length === 0 ? (
            <div className="p-8 text-center text-sm font-medium text-gray-500">نویسنده‌ای یافت نشد.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-right text-xs font-bold text-gray-500">نام</th>
                    <th className="px-5 py-3 text-right text-xs font-bold text-gray-500">موبایل</th>
                    <th className="px-5 py-3 text-right text-xs font-bold text-gray-500">وضعیت</th>
                    <th className="px-5 py-3 text-right text-xs font-bold text-gray-500">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {writers.map((writer) => (
                    <tr key={writer.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4 text-sm font-bold text-gray-900">{writer.full_name}</td>
                      <td className="px-5 py-4 text-sm text-gray-600" dir="ltr">{writer.phone}</td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                          writer.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}>
                          {writer.is_active ? "فعال" : "غیرفعال"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleEdit(writer)}
                            className="text-sm font-bold text-blue-600 hover:text-blue-800"
                          >
                            ویرایش
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(writer)}
                            className="text-sm font-bold text-red-600 hover:text-red-800"
                          >
                            حذف
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
