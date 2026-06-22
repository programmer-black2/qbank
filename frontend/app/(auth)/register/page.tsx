"use client";

import { useState } from "react";
import Link from "next/link";

function CheckIcon() {
  return (
    <svg className="h-5 w-5 text-green-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8z" />
    </svg>
  );
}

function RocketIcon() {
  return (
    <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M9.19 6.35c-2.04 2.29-3.44 5.58-3.57 5.89L2 10.69l4.05-4.05c.47-.47 1.15-.68 1.81-.55zM11.17 17s3.74-1.55 5.89-3.7c5.4-5.4 4.5-9.62 4.21-10.57-.95-.3-5.17-1.19-10.57 4.21C8.55 9.09 7 12.83 7 12.83zm6.48-2.19c-2.29 2.04-5.58 3.44-5.89 3.57L13.31 22l4.05-4.05c.47-.47.68-1.15.55-1.81zM9 18c0 .83-.34 1.58-.88 2.12C6.94 21.3 2 22 2 22s.7-4.94 1.88-6.12C4.42 15.34 5.17 15 6 15c1.66 0 3 1.34 3 3m4-9c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 5.9c1.16 0 2.1.94 2.1 2.1s-.94 2.1-2.1 2.1S9.9 9.16 9.9 8s.94-2.1 2.1-2.1m0 9c2.97 0 6.1 1.46 6.1 2.1v1.1H5.9V17c0-.64 3.13-2.1 6.1-2.1M12 4C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4m0 9c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4" />
    </svg>
  );
}

function BadgeIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M14 12h4v1.5h-4zm0 3h4v1.5h-4z" />
      <path d="M20 7h-5V4c0-1.1-.9-2-2-2h-2c-1.1 0-2 .9-2 2v3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2m-9 0V4h2v5h-2zm9 13H4V9h5c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2h5z" />
      <circle cx="9" cy="13.5" r="1.5" />
      <path d="M11.08 16.18c-.64-.28-1.34-.43-2.08-.43s-1.44.15-2.08.43c-.56.24-.92.78-.92 1.39V18h6v-.43c0-.61-.36-1.15-.92-1.39" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 14H4V8l8 5 8-5zm-8-7L4 6h16z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2M9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9zm9 14H6V10h12zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2" />
    </svg>
  );
}

function EyeIcon({ isHidden }: { isHidden: boolean }) {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.5-6.75 9.75-6.75S21.75 12 21.75 12 18.25 18.75 12 18.75 2.25 12 2.25 12Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      {isHidden && <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5 19.5 4.5" />}
    </svg>
  );
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);

  const inputShellClass =
    "flex min-h-14 items-center gap-3 rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 transition-all duration-300 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10";
  const inputClass =
    "auth-input w-full bg-transparent py-3 text-right text-sm font-medium text-slate-700 outline-none placeholder:text-slate-300";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f8fafc] p-4">
      <div className="absolute right-[-5%] top-[-10%] h-96 w-96 animate-pulse rounded-full bg-blue-100 opacity-60 blur-[120px]"></div>
      <div className="absolute bottom-[-10%] left-[-5%] h-96 w-96 rounded-full bg-yellow-100 opacity-60 blur-[120px]"></div>

      <div className="z-10 flex w-full max-w-[950px] flex-col overflow-hidden rounded-[40px] border border-white bg-white/80 shadow-[0_20px_70px_rgba(0,0,0,0.05)] backdrop-blur-xl duration-700 md:flex-row">
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#101010] p-12 text-white md:flex md:w-[40%]">
          <div className="relative z-10">
            <div className="mb-8 flex h-12 w-12 rotate-12 items-center justify-center rounded-2xl bg-blue-500 shadow-lg shadow-blue-500/50">
              <RocketIcon />
            </div>
            <h2 className="mb-6 text-3xl font-black leading-tight">
              سفر علمی خود را <br />
              از اینجا شروع کن!
            </h2>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm text-slate-300">
                <CheckIcon />
                دسترسی به ۲۰ هزار سوال
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-300">
                <CheckIcon />
                آزمون‌های شبیه‌ساز کنکور
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-300">
                <CheckIcon />
                تحلیل هوشمند سطح علمی
              </li>
            </ul>
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] opacity-10 [background-size:16px_16px]"></div>
        </aside>

        <main className="w-full bg-white p-8 md:w-[60%] md:p-12">
          <div className="mb-10 flex items-center justify-between">
            <h1 className="text-2xl font-black text-slate-800">
              ثبت‌نام دانش‌آموز
            </h1>
            <Link className="text-sm font-bold text-blue-600 hover:underline" href="/login">
              ورود به حساب
            </Link>
          </div>

          <form className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <div className="flex flex-col space-y-1.5">
                <label className="mr-1 text-xs font-bold text-slate-500">
                  نام و نام خانوادگی
                </label>
                <div className={inputShellClass}>
                  <span className="text-slate-400">
                    <UserIcon />
                  </span>
                  <input
                    type="text"
                    placeholder="مثلا: علی محمدی"
                    className={inputClass}
                    name="full_name"
                    autoComplete="name"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-1.5">
              <label className="mr-1 text-xs font-bold text-slate-500">
                نام کاربری
              </label>
              <div className={inputShellClass}>
                <span className="text-slate-400">
                  <BadgeIcon />
                </span>
                <input
                  type="text"
                  placeholder="ali_82"
                  className={`${inputClass} ltr`}
                  name="username"
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="flex flex-col space-y-1.5">
              <label className="mr-1 text-xs font-bold text-slate-500">
                ایمیل یا شماره موبایل
              </label>
              <div className={inputShellClass}>
                <span className="text-slate-400">
                  <MailIcon />
                </span>
                <input
                  type="text"
                  placeholder="mail@site.com یا 09123456789"
                  className={`${inputClass} ltr`}
                  name="phone_or_email"
                  autoComplete="username"
                  inputMode="email"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="flex flex-col space-y-1.5">
                <label className="mr-1 text-xs font-bold text-slate-500">
                  رمز عبور
                </label>
                <div className={inputShellClass}>
                  <span className="text-slate-400">
                    <LockIcon />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="حداقل ۶ کاراکتر"
                    className={`${inputClass} ltr`}
                    name="password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "مخفی کردن رمز عبور" : "نمایش رمز عبور"}
                    onClick={() => setShowPassword((value) => !value)}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <EyeIcon isHidden={!showPassword} />
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-4 text-xl font-bold text-white shadow-xl shadow-blue-200 transition-all hover:scale-[1.01] hover:shadow-blue-300 active:scale-[0.98] md:col-span-2"
            >
              ایجاد حساب کاربری
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
