"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  requestStudentRegisterOTP,
  verifyStudentRegisterOTP,
} from "@/services/auth/auth.api";

const toEnglishDigits = (value: string) =>
  value.replace(/[۰-۹٠-٩]/g, (digit) =>
    String("۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩".indexOf(digit) % 10)
  );

const normalizePhone = (value: string) => toEnglishDigits(value).trim();
const isValidPhone = (value: string) => /^09\d{9}$/.test(value);

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

function ArrowIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M10 17 5 12l5-5 1.42 1.42L8.84 11H19v2H8.84l2.58 2.58z" />
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

  return "درخواست انجام نشد. لطفا دوباره تلاش کنید.";
};

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "otp">("form");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    password: "",
    confirm_password: "",
    otp: "",
  });

  const inputShellClass =
    "flex min-h-14 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 transition-all focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10";
  const inputClass =
    "w-full bg-transparent py-3 text-right text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400";

  const updateField = (name: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const validateRegisterForm = () => {
    const phone = normalizePhone(form.phone);

    if (!form.full_name.trim()) return "نام و نام خانوادگی الزامی است.";
    if (!phone) return "شماره موبایل الزامی است.";
    if (!isValidPhone(phone)) return "شماره موبایل باید با 09 شروع شود و 11 رقم باشد.";
    if (!form.password) return "رمز عبور الزامی است.";
    if (form.password.length < 8) return "رمز عبور باید حداقل 8 کاراکتر باشد.";
    if (!form.confirm_password) return "تکرار رمز عبور الزامی است.";
    if (form.password !== form.confirm_password) return "رمز عبور و تکرار آن یکسان نیستند.";

    return "";
  };

  const handleRequestOTP = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationError = validateRegisterForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      const phone = normalizePhone(form.phone);
      await requestStudentRegisterOTP({
        full_name: form.full_name.trim(),
        phone,
        password: form.password,
      });
      setForm((prev) => ({ ...prev, phone }));
      setStep("otp");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (event: React.FormEvent) => {
    event.preventDefault();
    const code = toEnglishDigits(form.otp).trim();

    if (!code) {
      setError("کد تایید الزامی است.");
      return;
    }

    try {
      setLoading(true);
      const response = await verifyStudentRegisterOTP({
        phone: normalizePhone(form.phone),
        code,
        device_name: navigator.userAgent,
      });

      localStorage.setItem("access", response.access);
      localStorage.setItem("refresh", response.refresh);
      localStorage.setItem("user", JSON.stringify(response.user));
      window.dispatchEvent(new Event("auth-changed"));
      router.push("/category");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 p-3 sm:p-6" dir="rtl">
      <div className="mx-auto flex min-h-[calc(100vh-24px)] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)] md:min-h-[calc(100vh-48px)] md:flex-row">
        <aside className="relative flex min-h-48 flex-col justify-between overflow-hidden bg-blue-600 p-6 text-white sm:p-8 md:w-[42%] md:p-10">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.22),transparent_42%,rgba(191,219,254,0.34))]" />
          <div className="relative z-10">
            <Link href="/" className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white text-blue-700 shadow-lg shadow-blue-900/10 transition-colors hover:bg-blue-50" aria-label="بازگشت به صفحه اصلی">
              <ArrowIcon />
            </Link>
            <h2 className="max-w-sm text-2xl font-black leading-10 sm:text-3xl">
              حساب دانشجویی خودت رو ایجاد کن و به دنیایی از سوالات وارد شو
            </h2>
            <p className="mt-4 max-w-sm text-sm font-medium leading-7 text-blue-50"></p>
          </div>
          <div className="relative z-10 mt-8 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl border border-white/30 bg-white/15 p-3">
              <div className="text-lg font-black">تعداد سوالات</div>
              <div className="mt-1 text-[11px] text-blue-50">+20000</div>
            </div>
            <div className="rounded-xl border border-white/30 bg-white/15 p-3">
              <div className="text-lg font-black">تعداد دانشجو</div>
              <div className="mt-1 text-[11px] text-blue-50">+200</div>
            </div>
            <div className="rounded-xl border border-white/30 bg-white/15 p-3">
              <div className="text-lg font-black">تعداد درس</div>
              <div className="mt-1 text-[11px] text-blue-50">+100</div>
            </div>
          </div>
        </aside>

        <main className="flex w-full items-center justify-center p-5 sm:p-8 md:w-[58%] lg:p-12">
          <div className="w-full max-w-xl">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-blue-600">
                  {step === "form" ? "ثبت نام" : "تایید شماره"}
                </p>
                <h1 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">ثبت نام دانش آموز</h1>
                <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                  {step === "form" ? "اطلاعات حساب را کامل وارد کنید." : `کد ارسال شده به ${form.phone} را وارد کنید.`}
                </p>
              </div>
              <Link
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-blue-100 bg-blue-600 px-5 text-sm font-black text-white shadow-sm shadow-blue-100 transition-colors hover:bg-blue-700"
                href="/login"
              >
                ورود
                <ArrowIcon />
              </Link>
            </div>

            {error && (
              <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                {error}
              </div>
            )}

            {step === "form" ? (
              <form onSubmit={handleRequestOTP} className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-xs font-bold text-slate-600">نام و نام خانوادگی</label>
                  <div className={inputShellClass}>
                    <input
                      type="text"
                      value={form.full_name}
                      onChange={(event) => updateField("full_name", event.target.value)}
                      placeholder="مثلا: علی محمدی"
                      className={inputClass}
                      autoComplete="name"
                      required
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-xs font-bold text-slate-600">شماره موبایل</label>
                  <div className={inputShellClass}>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(event) => updateField("phone", event.target.value)}
                      placeholder="09123456789"
                      className={`${inputClass} text-left ltr`}
                      autoComplete="tel"
                      inputMode="numeric"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-600">رمز عبور</label>
                  <div className={inputShellClass}>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(event) => updateField("password", event.target.value)}
                      placeholder="حداقل 8 کاراکتر"
                      className={`${inputClass} text-left ltr`}
                      autoComplete="new-password"
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

                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-600">تکرار رمز عبور</label>
                  <div className={inputShellClass}>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.confirm_password}
                      onChange={(event) => updateField("confirm_password", event.target.value)}
                      placeholder="تکرار رمز عبور"
                      className={`${inputClass} text-left ltr`}
                      autoComplete="new-password"
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

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 h-14 rounded-xl bg-blue-600 text-base font-black text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
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
                      value={form.otp}
                      onChange={(event) => updateField("otp", event.target.value)}
                      placeholder="کد پیامک شده"
                      className={`${inputClass} text-center text-lg tracking-[0.4em] ltr`}
                      inputMode="numeric"
                      autoComplete="one-time-code"
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
                  onClick={() => setStep("form")}
                  className="h-12 w-full rounded-xl border border-slate-200 text-sm font-black text-slate-700 transition-colors hover:bg-slate-50"
                >
                  ویرایش اطلاعات
                </button>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
