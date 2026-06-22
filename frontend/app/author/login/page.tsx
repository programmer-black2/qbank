"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/services/auth/auth.api";

const normalizeDigits = (value: string) =>
  value
    .trim()
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));

const getErrorMessage = (error: unknown) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const data = (error as { response?: { data?: unknown } }).response?.data;

    if (typeof data === "string") return data;

    if (typeof data === "object" && data !== null) {
      const record = data as Record<string, unknown>;
      const detail = record.detail || record.non_field_errors;

      if (Array.isArray(detail)) return String(detail[0]);
      if (typeof detail === "string") return detail;
    }
  }

  return "ورود ناموفق بود. اطلاعات را بررسی کنید.";
};

export default function AuthorLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    phone_or_email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await loginUser({
        ...formData,
        phone_or_email: normalizeDigits(formData.phone_or_email),
      });

      if (response.user?.role !== "Writer") {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("user");
        setError("دسترسی نویسنده مورد نیاز است.");
        return;
      }

      localStorage.setItem("access", response.access);
      localStorage.setItem("refresh", response.refresh);
      localStorage.setItem("user", JSON.stringify(response.user));

      router.push("/author");
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8fafc] p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 text-right shadow-sm"
      >
        <h1 className="mb-2 text-2xl font-black text-slate-900">
          ورود نویسنده
        </h1>
        <p className="mb-6 text-sm font-medium text-slate-500">
          این ورود فقط برای نقش نویسنده است.
        </p>

        {error && (
          <div className="mb-4 rounded-xl border border-red-100 bg-red-50 p-3 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-xs font-bold text-slate-500">
              شماره موبایل یا ایمیل
            </span>
            <input
              value={formData.phone_or_email}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  phone_or_email: event.target.value,
                }))
              }
              className="auth-input w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-300 focus:bg-white"
              dir="ltr"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-bold text-slate-500">
              رمز عبور
            </span>
            <div className="auth-input-shell flex items-center rounded-xl border border-slate-200 bg-slate-50 px-4 focus-within:border-blue-300 focus-within:bg-white">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    password: event.target.value,
                  }))
                }
                className="auth-input w-full bg-transparent py-3 text-sm outline-none"
                dir="ltr"
                required
              />
              <button
                type="button"
                aria-label={showPassword ? "مخفی کردن رمز عبور" : "نمایش رمز عبور"}
                onClick={() => setShowPassword((value) => !value)}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.5-6.75 9.75-6.75S21.75 12 21.75 12 18.25 18.75 12 18.75 2.25 12 2.25 12Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  {!showPassword && (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5 19.5 4.5" />
                  )}
                </svg>
              </button>
            </div>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "در حال ورود..." : "ورود به پنل نویسنده"}
        </button>
      </form>
    </main>
  );
}
