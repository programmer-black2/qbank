"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/services/auth/auth.api";

export default function AuthorLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    phone_or_email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await loginUser(formData);

      if (response.user?.role !== "Writer") {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("user");
        setError("دسترسی نویسنده مورد نیاز است");
        return;
      }

      localStorage.setItem("access", response.access);
      localStorage.setItem("refresh", response.refresh);
      localStorage.setItem("user", JSON.stringify(response.user));

      router.push("/author");
    } catch {
      setError("ورود ناموفق بود. اطلاعات را بررسی کنید.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8fafc] p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 text-right shadow-sm "
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
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-300 focus:bg-white"
              dir="ltr"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-bold text-slate-500">
              رمز عبور
            </span>
            <input
              type="password"
              value={formData.password}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  password: event.target.value,
                }))
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-300 focus:bg-white"
              dir="ltr"
              required
            />
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
