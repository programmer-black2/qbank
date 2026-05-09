'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser } from "../../../services/auth/auth.api";

export default function AdminLogin() {
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

      console.log("ADMIN LOGIN SUCCESS:", response);

      // ذخیره توکن‌ها در localStorage
      localStorage.setItem("access", response.access);
      localStorage.setItem("refresh", response.refresh);
      localStorage.setItem("user", JSON.stringify(response.user));

      // انتقال به داشبورد ادمین
      router.push("/admin/dashboard");

    } catch (err: any) {
      console.error("Login error:", err);

      if (err.response?.data?.non_field_errors) {
        setError(err.response.data.non_field_errors[0]);
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("خطا در ورود. لطفاً دوباره تلاش کنید.");
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      {/* پس‌زمینه تزئینی */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 left-20 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* کارت لاگین */}
      <div className="relative bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 w-full max-w-md border border-white/20">
        
        {/* هدر */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">پنل مدیریت</h1>
          <p className="text-gray-600 text-sm">ورود به سیستم مدیریت بانک سوال</p>
        </div>

        {/* فرم لاگین */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* نمایش خطا */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* فیلد نام کاربری */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 block">
              شماره موبایل یا ایمیل
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                type="text"
                name="phone_or_email"
                value={formData.phone_or_email}
                onChange={handleChange}
                required
                className="w-full pr-12 pl-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm"
                placeholder="09xxxxxxxxx یا email@example.com"
                dir="ltr"
              />
            </div>
          </div>

          {/* فیلد رمز عبور */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 block">
              رمز عبور
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full pr-12 pl-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 left-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* گزینه مرا بخاطر بسپار */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center space-x-2 space-x-reverse cursor-pointer">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-gray-600">مرا به خاطر بسپار</span>
            </label>
          </div>

          {/* دکمه ورود */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2 space-x-reverse">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>در حال ورود...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2 space-x-reverse">
                <span>ورود به پنل مدیریت</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </div>
            )}
          </button>

        </form>

        {/* فوتر */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            © 2024 پنل مدیریت بانک سوال پزشکی
          </p>
        </div>
      </div>
    </div>
  );
}