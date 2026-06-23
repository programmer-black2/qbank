"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  requestStudentLoginOTP,
  verifyStudentLoginOTP,
} from "../../../services/auth/auth.api";

const toEnglishDigits = (value: string) =>
  value.replace(/[۰-۹٠-٩]/g, (digit) =>
    String("۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩".indexOf(digit) % 10)
  );

const normalizePhone = (value: string) => toEnglishDigits(value).trim();
const isValidPhone = (value: string) => /^09\d{9}$/.test(value);
const getDeviceName = () => navigator.userAgent.slice(0, 120);

function EyeIcon({ open }: { open: boolean }) {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      {open ? (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.5-6.75 9.75-6.75S21.75 12 21.75 12 18.25 18.75 12 18.75 2.25 12 2.25 12Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </>
      ) : (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.22A18.2 18.2 0 0 0 2.25 12s3.5 6.75 9.75 6.75c1.62 0 3.06-.45 4.3-1.08" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.23 6.23A9.7 9.7 0 0 1 12 5.25c6.25 0 9.75 6.75 9.75 6.75a17.6 17.6 0 0 1-2.87 3.88" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.88 9.88A3 3 0 0 1 14.12 14.12M4.5 4.5l15 15" />
        </>
      )}
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17 9h-1V7A4 4 0 0 0 8 7v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2M10 7a2 2 0 0 1 4 0v2h-4z" />
    </svg>
  );
}

const getErrorMessage = (error: unknown) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response
  ) {
    const data = error.response.data;
    if (typeof data === "string") return data;
    if (typeof data === "object" && data !== null) {
      const firstValue = Object.values(data)[0];
      if (Array.isArray(firstValue)) return String(firstValue[0]);
      if (typeof firstValue === "string") return firstValue;
    }
  }

  return "ورود انجام نشد. لطفا دوباره تلاش کنید.";
};

export default function Login() {
  const router = useRouter();
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
    otp: "",
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateField = (name: keyof typeof formData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const validateCredentials = () => {
    const phone = normalizePhone(formData.phone);

    if (!phone) return "شماره موبایل الزامی است.";
    if (!isValidPhone(phone)) return "شماره موبایل باید با 09 شروع شود و 11 رقم باشد.";
    if (!formData.password) return "رمز عبور الزامی است.";

    return "";
  };

  const handleRequestOTP = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationError = validateCredentials();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      const phone = normalizePhone(formData.phone);
      await requestStudentLoginOTP({
        phone,
        password: formData.password,
      });
      setFormData((prev) => ({ ...prev, phone }));
      setStep("otp");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (event: React.FormEvent) => {
    event.preventDefault();
    const code = toEnglishDigits(formData.otp).trim();

    if (!code) {
      setError("کد تایید الزامی است.");
      return;
    }

    try {
      setLoading(true);
      const response = await verifyStudentLoginOTP({
        phone: normalizePhone(formData.phone),
        code,
        device_name: getDeviceName(),
      });

      localStorage.setItem("access", response.access);
      localStorage.setItem("refresh", response.refresh);
      localStorage.setItem("user", JSON.stringify(response.user));
      window.dispatchEvent(new Event("auth-changed"));

      const next = new URLSearchParams(window.location.search).get("next");
      router.push(next && !next.startsWith("/admin") ? next : "/");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const inputShellClass =
    "flex min-h-14 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 transition-all focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10";

  return (
    <div className="min-h-screen bg-blue-50 p-3 sm:p-6" dir="rtl">
      <div className="mx-auto flex min-h-[calc(100vh-24px)] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)] md:min-h-[calc(100vh-48px)] md:flex-row">
        <main className="flex w-full items-center justify-center p-5 sm:p-8 md:w-[56%] lg:p-12">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <p className="text-xs font-black uppercase tracking-widest text-blue-600">
                {step === "credentials" ? "ورود امن" : "تایید موبایل"}
              </p>
              <h1 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">
                {step === "credentials" ? "خوش برگشتی!" : "کد تایید را وارد کن"}
              </h1>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                {step === "credentials"
                  ? "شماره موبایل و رمز عبور را وارد کنید تا کد تایید ارسال شود."
                  : `کد ارسال شده به ${formData.phone} را وارد کنید.`}
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                {error}
              </div>
            )}

            {step === "credentials" ? (
              <form onSubmit={handleRequestOTP} className="space-y-5">
                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-600">شماره موبایل</label>
                  <div className={inputShellClass}>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={(event) => updateField("phone", event.target.value)}
                      placeholder="09123456789"
                      className="w-full bg-transparent py-3 text-left text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400 ltr"
                      autoComplete="tel"
                      inputMode="numeric"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-600">رمز عبور</label>
                  <div className={`${inputShellClass} pl-2`}>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={(event) => updateField("password", event.target.value)}
                      placeholder="رمز عبور"
                      className="min-w-0 flex-1 bg-transparent py-3 text-left text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400 ltr"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "مخفی کردن رمز عبور" : "نمایش رمز عبور"}
                      onClick={() => setShowPassword((value) => !value)}
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-blue-600"
                    >
                      <EyeIcon open={showPassword} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-3 text-xs sm:flex-row sm:items-center sm:justify-between">
                  <label className="flex cursor-pointer items-center gap-2 text-slate-500">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={(event) => updateField("rememberMe", event.target.checked)}
                      className="accent-blue-600"
                    />
                    مرا به خاطر بسپار
                  </label>
                  <Link href="/forgot-password" className="font-bold text-blue-600 hover:underline">
                    فراموشی رمز؟
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="h-14 w-full rounded-xl bg-blue-600 text-base font-black text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "در حال ارسال کد..." : "دریافت کد تایید"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-5">
                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-600">کد تایید</label>
                  <div className={inputShellClass}>
                    <input
                      type="text"
                      value={formData.otp}
                      onChange={(event) => updateField("otp", event.target.value)}
                      placeholder="کد پیامک شده"
                      className="w-full bg-transparent py-3 text-center text-lg font-medium tracking-[0.4em] text-slate-800 outline-none placeholder:text-slate-400 ltr"
                      autoComplete="one-time-code"
                      inputMode="numeric"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="h-14 w-full rounded-xl bg-blue-600 text-base font-black text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "در حال تایید..." : "تایید و ورود"}
                </button>

                <button
                  type="button"
                  onClick={() => setStep("credentials")}
                  className="h-12 w-full rounded-xl border border-slate-200 text-sm font-black text-slate-700 transition-colors hover:bg-slate-50"
                >
                  ویرایش شماره یا رمز
                </button>
              </form>
            )}

            <div className="mt-8">
              <Link
                href="/register"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-black text-slate-800 transition-colors hover:bg-slate-50"
              >
                ایجاد حساب جدید
              </Link>
            </div>
          </div>
        </main>

        <aside className="relative flex min-h-52 flex-col justify-between overflow-hidden bg-blue-600 p-6 text-white sm:p-8 md:w-[44%] md:p-10">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.22),transparent_45%,rgba(191,219,254,0.34))]" />
          <div className="relative z-10">
            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white text-blue-700 shadow-lg shadow-blue-900/10">
              <LockIcon />
            </div>
              <h2 className="max-w-sm text-2xl font-black leading-10 sm:text-3xl">
              برای ورود به داشبورد کاربری اقدام کنید.
            </h2>
            <p className="mt-4 max-w-sm text-sm font-medium leading-7 text-blue-50">
              رمز عبور ابتدا بررسی می شود و سپس کد تایید فقط برای شماره موبایل ثبت شده ارسال می شود.
            </p>
          </div>
          <div className="relative z-10 mt-8 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/30 bg-white/15 p-4">
              <div className="text-sm font-black text-white">رمز عبور</div>
              <div className="mt-1 text-xs leading-5 text-blue-50">مرحله اول ورود</div>
            </div>
            <div className="rounded-xl border border-white/30 bg-white/15 p-4">
              <div className="text-sm font-black text-white">کد پیامکی</div>
              <div className="mt-1 text-xs leading-5 text-blue-50">مرحله دوم تایید</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
