"use client";

import { useState } from "react";
import Button from "../ui/Button";

type TextFieldProps = {
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  icon: React.ReactNode;
  endSlot?: React.ReactNode;
};

function TextField({
  label,
  name,
  placeholder,
  type = "text",
  autoComplete,
  inputMode,
  icon,
  endSlot,
}: TextFieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="mr-1 block text-xs font-black text-slate-500">
        {label}
      </label>
      <div className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 shadow-sm transition-all duration-200 focus-within:border-blue-400 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-blue-100/60">
        <span className="shrink-0 text-slate-400 transition-colors group-focus-within:text-blue-600">
          {icon}
        </span>
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          className="min-h-12 w-full bg-transparent text-sm font-bold text-slate-800 outline-none placeholder:text-slate-300"
        />
        {endSlot}
      </div>
    </div>
  );
}

function UserIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4m0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2m0 4-8 5-8-5V6l8 5 8-5z" />
    </svg>
  );
}

function BadgeIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20 7h-5V4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v3H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2m-9-3h2v5h-2zm9 16H4V9h5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2h5z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18 8h-1V6A5 5 0 0 0 7 6v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2M9 6a3 3 0 0 1 6 0v2H9zm9 14H6V10h12z" />
    </svg>
  );
}

function EyeIcon({ crossed }: { crossed: boolean }) {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.5-6.75 9.75-6.75S21.75 12 21.75 12 18.25 18.75 12 18.75 2.25 12 2.25 12Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      {crossed && <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5 19.5 4.5" />}
    </svg>
  );
}

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-8 shadow-2xl shadow-slate-200/70">
      <h2 className="mb-6 text-center text-xl font-black text-slate-900">
        ثبت‌نام دانش‌آموز
      </h2>

      <div className="space-y-4">
        <TextField
          label="نام و نام خانوادگی"
          name="full_name"
          placeholder="مثلا: علی محمدی"
          autoComplete="name"
          icon={<UserIcon />}
        />
        <TextField
          label="ایمیل/شماره تلفن"
          name="email/phone"
          placeholder="mail@site.com"
          autoComplete="email/phone"
          icon={<MailIcon />}
        />
        <TextField
          label="نام مستعار (ID)"
          name="username"
          placeholder="ali_A7"
          autoComplete="username"
          icon={<BadgeIcon />}
        />
        <TextField
          label="رمز عبور"
          name="password"
          placeholder="حداقل ۶ کاراکتر"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          icon={<LockIcon />}
          endSlot={
            <button
              type="button"
              aria-label={showPassword ? "مخفی کردن رمز عبور" : "نمایش رمز عبور"}
              onClick={() => setShowPassword((value) => !value)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <EyeIcon crossed={showPassword} />
            </button>
          }
        />
      </div>

      <Button className="mt-6 w-full rounded-2xl py-4 font-black shadow-lg shadow-blue-100">
        ساخت حساب کاربری و شروع آزمون
      </Button>

      <p className="mt-4 cursor-pointer text-center text-sm font-bold text-blue-600 transition-colors hover:text-blue-700">
        ورود به حساب
      </p>
    </div>
  );
}
