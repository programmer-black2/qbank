'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginUser } from "../../../services/auth/auth.api";

export default function login() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    phone_or_email: '',
    password: '',
    rememberMe: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await loginUser({
        phone_or_email: formData.phone_or_email,
        password: formData.password,
      });

      console.log("LOGIN SUCCESS:", response);

      localStorage.setItem("access", response.access);
      localStorage.setItem("refresh", response.refresh);

      router.push("/admin/dashboard");

    } catch (err: any) {
      console.error(err);

      setError("نام کاربری یا رمز عبور اشتباه است");

    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* SVG Sprite برای آیکون‌ها */}
      <svg className="hidden">
        <symbol id="eye" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </symbol>
        <symbol id="exclamation-triangle" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </symbol>
        <symbol id="chevron-down" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </symbol>
        <symbol id="user" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </symbol>
        <symbol id="face-smile" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
        </symbol>
      </svg>

      <div>
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 relative overflow-hidden">
          {/* بک‌گراندهای تزئینی */}
          <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-indigo-100 rounded-full blur-[120px] opacity-60"></div>
          <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-blue-100 rounded-full blur-[120px] opacity-60"></div>

          {/* کارت اصلی */}
          <div className="bg-white/80 backdrop-blur-xl w-full max-w-[900px] rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col md:flex-row border border-white z-10 animate-in fade-in duration-700">

            {/* بخش فرم - سمت راست در موبایل، چپ در دسکتاپ */}
            <div className="w-full md:w-1/2 p-8 md:p-14 bg-white">
              <div className="mb-10 text-center md:text-right">
                {/* آیکون موبایل */}
                <div className="inline-flex md:hidden mb-4 p-3 bg-blue-50 text-blue-600 rounded-2xl">
                  <svg className="w-7 h-7" focusable="false" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.81 4.47c-.08 0-.16-.02-.23-.06C15.66 3.42 14 3 12.01 3c-1.98 0-3.86.47-5.57 1.41-.24.13-.54.04-.68-.2-.13-.24-.04-.55.2-.68C7.82 2.52 9.86 2 12.01 2c2.13 0 3.99.47 6.03 1.52.25.13.34.43.21.67-.09.18-.26.28-.44.28M3.5 9.72c-.1 0-.2-.03-.29-.09-.23-.16-.28-.47-.12-.7.99-1.4 2.25-2.5 3.75-3.27C9.98 4.04 14 4.03 17.15 5.65c1.5.77 2.76 1.86 3.75 3.25.16.22.11.54-.12.7s-.54.11-.7-.12c-.9-1.26-2.04-2.25-3.39-2.94-2.87-1.47-6.54-1.47-9.4.01-1.36.7-2.5 1.7-3.4 2.96-.08.14-.23.21-.39.21m6.25 12.07c-.13 0-.26-.05-.35-.15-.87-.87-1.34-1.43-2.01-2.64-.69-1.23-1.05-2.73-1.05-4.34 0-2.97 2.54-5.39 5.66-5.39s5.66 2.42 5.66 5.39c0 .28-.22.5-.5.5s-.5-.22-.5-.5c0-2.42-2.09-4.39-4.66-4.39s-4.66 1.97-4.66 4.39c0 1.44.32 2.77.93 3.85.64 1.15 1.08 1.64 1.85 2.42.19.2.19.51 0 .71-.11.1-.24.15-.37.15m7.17-1.85c-1.19 0-2.24-.3-3.1-.89-1.49-1.01-2.38-2.65-2.38-4.39 0-.28.22-.5.5-.5s.5.22.5.5c0 1.41.72 2.74 1.94 3.56.71.48 1.54.71 2.54.71.24 0 .64-.03 1.04-.1.27-.05.53.13.58.41.05.27-.13.53-.41.58-.57.11-1.07.12-1.21.12M14.91 22c-.04 0-.09-.01-.13-.02-1.59-.44-2.63-1.03-3.72-2.1-1.4-1.39-2.17-3.24-2.17-5.22 0-1.62 1.38-2.94 3.08-2.94s3.08 1.32 3.08 2.94c0 1.07.93 1.94 2.08 1.94s2.08-.87 2.08-1.94c0-3.77-3.25-6.83-7.25-6.83-2.84 0-5.44 1.58-6.61 4.03-.39.81-.59 1.76-.59 2.8 0 .78.07 2.01.67 3.61.1.26-.03.55-.29.64-.26.1-.55-.04-.64-.29-.49-1.31-.73-2.61-.73-3.96 0-1.2.23-2.29.68-3.24 1.33-2.79 4.28-4.6 7.51-4.6 4.55 0 8.25 3.51 8.25 7.83 0 1.62-1.38 2.94-3.08 2.94s-3.08-1.32-3.08-2.94c0-1.07-.93-1.94-2.08-1.94s-2.08.87-2.08 1.94c0 1.71.66 3.31 1.87 4.51.95.94 1.86 1.46 3.27 1.85.27.07.42.35.35.61-.05.23-.26.38-.47.38" />
                  </svg>
                </div>
                <h1 className="text-3xl font-black text-slate-800 mb-2">خوش برگشتی!</h1>
                <p className="text-slate-400 text-sm italic font-medium">لطفاً اطلاعات حساب خود را وارد کنید</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* فیلد نام کاربری */}
                <div className="space-y-2 flex flex-col">
                  <label className="text-xs font-bold text-slate-500 mr-1">نام کاربری</label>
                  <div className="flex items-center bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 transition-all focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/5">
                    <svg className="w-5 h-5 text-slate-400" focusable="false" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 5.9c1.16 0 2.1.94 2.1 2.1s-.94 2.1-2.1 2.1S9.9 9.16 9.9 8s.94-2.1 2.1-2.1m0 9c2.97 0 6.1 1.46 6.1 2.1v1.1H5.9V17c0-.64 3.13-2.1 6.1-2.1M12 4C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4m0 9c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4" />
                    </svg>
                    <input
                      type="text"
                      name="phone_or_email"
                      value={formData.phone_or_email}
                      onChange={handleChange}
                      placeholder="Phone or Email"
                      className="w-full p-4 bg-transparent outline-none text-sm text-slate-700 ltr text-right"
                    />
                  </div>
                </div>

                {/* فیلد رمز عبور */}
                <div className="space-y-2 flex flex-col relative">
                  <label className="text-xs font-bold text-slate-500 mr-1">رمز عبور</label>
                  <div className="flex items-center bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 transition-all focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/5">
                    <svg className="w-5 h-5 text-slate-400" focusable="false" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2M9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9zm9 14H6V10h12zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2" />
                    </svg>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full p-4 bg-transparent outline-none text-sm text-slate-700 ltr text-right"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-4 top-[33px] text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    <svg className="w-5 h-5" focusable="false" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5M12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5m0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3" />
                    </svg>
                  </button>
                </div>

                {/* گزینه‌های اضافی */}
                <div className="flex justify-between items-center text-xs px-1">
                  <label className="flex items-center gap-2 text-slate-500 cursor-pointer">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      className="accent-blue-600"
                    />
                    مرا به خاطر بسپار
                  </label>
                  <Link href="/forgot-password" className="text-blue-600 font-bold hover:underline">
                    فراموشی رمز؟
                  </Link>
                </div>

                {/* دکمه ورود */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-2xl font-bold shadow-xl shadow-blue-100 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                >
                  <span>
                    {loading ? "در حال ورود..." : "ورود به پنل کاربری"}
                  </span>
                  <svg className="w-5 h-5" focusable="false" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11 7 9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8z" />
                  </svg>
                </button>
              </form>

              {/* لینک ثبت نام */}
              <div className="mt-8 text-center">
                <p className="text-sm text-slate-500">
                  هنوز ثبت‌نام نکرده‌ای؟
                  <Link href="/register" className="text-blue-600 font-black hover:underline underline-offset-4 decoration-2 mr-1">
                    ایجاد حساب جدید
                  </Link>
                </p>
              </div>
            </div>

            {/* بخش سمت راست - تزئینی */}
            <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 p-12 text-white flex-col justify-center items-center relative text-center">
              <div className="relative z-10 space-y-6">
                <div className="w-20 h-20 bg-white/10 backdrop-blur-lg rounded-[2rem] flex items-center justify-center mx-auto mb-4 border border-white/20 shadow-2xl animate-bounce duration-[3000ms]">
                  <svg className="w-11 h-11 text-white" focusable="false" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.81 4.47c-.08 0-.16-.02-.23-.06C15.66 3.42 14 3 12.01 3c-1.98 0-3.86.47-5.57 1.41-.24.13-.54.04-.68-.2-.13-.24-.04-.55.2-.68C7.82 2.52 9.86 2 12.01 2c2.13 0 3.99.47 6.03 1.52.25.13.34.43.21.67-.09.18-.26.28-.44.28M3.5 9.72c-.1 0-.2-.03-.29-.09-.23-.16-.28-.47-.12-.7.99-1.4 2.25-2.5 3.75-3.27C9.98 4.04 14 4.03 17.15 5.65c1.5.77 2.76 1.86 3.75 3.25.16.22.11.54-.12.7s-.54.11-.7-.12c-.9-1.26-2.04-2.25-3.39-2.94-2.87-1.47-6.54-1.47-9.4.01-1.36.7-2.5 1.7-3.4 2.96-.08.14-.23.21-.39.21m6.25 12.07c-.13 0-.26-.05-.35-.15-.87-.87-1.34-1.43-2.01-2.64-.69-1.23-1.05-2.73-1.05-4.34 0-2.97 2.54-5.39 5.66-5.39s5.66 2.42 5.66 5.39c0 .28-.22.5-.5.5s-.5-.22-.5-.5c0-2.42-2.09-4.39-4.66-4.39s-4.66 1.97-4.66 4.39c0 1.44.32 2.77.93 3.85.64 1.15 1.08 1.64 1.85 2.42.19.2.19.51 0 .71-.11.1-.24.15-.37.15m7.17-1.85c-1.19 0-2.24-.3-3.1-.89-1.49-1.01-2.38-2.65-2.38-4.39 0-.28.22-.5.5-.5s.5.22.5.5c0 1.41.72 2.74 1.94 3.56.71.48 1.54.71 2.54.71.24 0 .64-.03 1.04-.1.27-.05.53.13.58.41.05.27-.13.53-.41.58-.57.11-1.07.12-1.21.12M14.91 22c-.04 0-.09-.01-.13-.02-1.59-.44-2.63-1.03-3.72-2.1-1.4-1.39-2.17-3.24-2.17-5.22 0-1.62 1.38-2.94 3.08-2.94s3.08 1.32 3.08 2.94c0 1.07.93 1.94 2.08 1.94s2.08-.87 2.08-1.94c0-3.77-3.25-6.83-7.25-6.83-2.84 0-5.44 1.58-6.61 4.03-.39.81-.59 1.76-.59 2.8 0 .78.07 2.01.67 3.61.1.26-.03.55-.29.64-.26.1-.55-.04-.64-.29-.49-1.31-.73-2.61-.73-3.96 0-1.2.23-2.29.68-3.24 1.33-2.79 4.28-4.6 7.51-4.6 4.55 0 8.25 3.51 8.25 7.83 0 1.62-1.38 2.94-3.08 2.94s-3.08-1.32-3.08-2.94c0-1.07-.93-1.94-2.08-1.94s-2.08.87-2.08 1.94c0 1.71.66 3.31 1.87 4.51.95.94 1.86 1.46 3.27 1.85.27.07.42.35.35.61-.05.23-.26.38-.47.38" />
                  </svg>
                </div>
                <h2 className="text-3xl font-black italic">امنیت و سرعت</h2>
                <p className="text-blue-100/70 text-sm leading-relaxed max-w-[280px] mx-auto">
                  با ورود به حساب کاربری خود، تمام سوابق آزمون‌ها و پیشرفت تحصیلی شما به صورت هوشمند تحلیل می‌شود.
                </p>
              </div>

              {/* افکت‌های پس زمینه */}
              <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none">
                <div className="absolute top-[20%] right-[10%] w-32 h-32 bg-white rounded-full blur-3xl"></div>
                <div className="absolute bottom-[20%] left-[10%] w-32 h-32 bg-indigo-400 rounded-full blur-3xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
