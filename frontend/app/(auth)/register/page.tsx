import LoginForm from "../../../components/login/LoginForm";
import LoginBanner from "../../../components/login/LoginBanner";

export default function Login() {
  return (
    <>
      <div>
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 dir-rtl overflow-hidden relative">
          <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-100 rounded-full blur-[120px] opacity-60 animate-pulse">
          </div>
          <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-yellow-100 rounded-full blur-[120px] opacity-60">
          </div>
          <div className="bg-white/80 backdrop-blur-xl w-full max-w-[950px] rounded-[40px] shadow-[0_20px_70px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col md:flex-row border border-white z-10 animate-in fade-in zoom-in duration-700">
            <div className="hidden md:flex md:w-[40%] bg-[#101010] p-12 text-white flex-col justify-between relative overflow-hidden">
              <div className="relative z-10">
                <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center mb-8 rotate-12 shadow-lg shadow-blue-500/50">
                  <svg
                    className="w-6 h-6 text-white"
                    focusable="false"
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9.19 6.35c-2.04 2.29-3.44 5.58-3.57 5.89L2 10.69l4.05-4.05c.47-.47 1.15-.68 1.81-.55zM11.17 17s3.74-1.55 5.89-3.7c5.4-5.4 4.5-9.62 4.21-10.57-.95-.3-5.17-1.19-10.57 4.21C8.55 9.09 7 12.83 7 12.83zm6.48-2.19c-2.29 2.04-5.58 3.44-5.89 3.57L13.31 22l4.05-4.05c.47-.47.68-1.15.55-1.81zM9 18c0 .83-.34 1.58-.88 2.12C6.94 21.3 2 22 2 22s.7-4.94 1.88-6.12C4.42 15.34 5.17 15 6 15c1.66 0 3 1.34 3 3m4-9c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2"></path>
                  </svg>
                </div>
                <h2 className="text-3xl font-black mb-6 leading-tight">
                  سفر علمی خود را <br />
                  از اینجا شروع کن!
                </h2>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3 text-sm text-slate-300">
                    <svg
                      className="w-5 h-5 text-green-500"
                      focusable="false"
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8z"></path>
                    </svg>
                    دسترسی به ۲۰ هزار سوال
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-300">
                    <svg
                      className="w-5 h-5 text-green-500"
                      focusable="false"
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8z"></path>
                    </svg>
                    آزمون‌های شبیه‌ساز کنکور
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-300">
                    <svg
                      className="w-5 h-5 text-green-500"
                      focusable="false"
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8z"></path>
                    </svg>
                    تحلیل هوشمند سطح علمی
                  </li>
                </ul>
              </div>
              {/* <p className="text-slate-400 text-xs z-10">
                Smart Question Bank v2.0
              </p> */}
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>
            </div>

            <div className="w-full md:w-[60%] p-8 md:p-12 bg-white">
              <div className="flex justify-between items-center mb-10">
                <h1 className="text-2xl font-black text-slate-800">
                  ثبت‌نام دانش‌آموز
                </h1>
                <a
                  className="text-blue-600 text-sm font-bold hover:underline"
                  href="/login"
                >
                  ورود به حساب
                </a>
              </div>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <div className="space-y-1.5 flex flex-col">
                    <label className="text-xs font-bold text-slate-500 mr-1">
                      نام و نام‌خانوادگی
                    </label>
                    <div className="flex items-center bg-slate-50 border-2 rounded-2xl px-4 transition-all duration-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10 border-slate-100 focus-within:border-blue-500">
                      <span className="text-slate-400">
                        <svg
                          className="w-6 h-6"
                          focusable="false"
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 5.9c1.16 0 2.1.94 2.1 2.1s-.94 2.1-2.1 2.1S9.9 9.16 9.9 8s.94-2.1 2.1-2.1m0 9c2.97 0 6.1 1.46 6.1 2.1v1.1H5.9V17c0-.64 3.13-2.1 6.1-2.1M12 4C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4m0 9c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4"></path>
                        </svg>
                      </span>
                      <input
                        type="text"
                        placeholder="مثلا: علی محمدی"
                        className="w-full p-3.5 bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-300"
                        name="username"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 flex flex-col">
                  <label className="text-xs font-bold text-slate-500 mr-1">
                    نام کاربری
                  </label>
                  <div className="flex items-center bg-slate-50 border-2 rounded-2xl px-4 transition-all duration-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10 border-slate-100 focus-within:border-blue-500">
                    <span className="text-slate-400">
                      <svg
                        className="w-6 h-6"
                        focusable="false"
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                      >
                        <path d="M14 12h4v1.5h-4zm0 3h4v1.5h-4z"></path>
                        <path d="M20 7h-5V4c0-1.1-.9-2-2-2h-2c-1.1 0-2 .9-2 2v3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2m-9 0V4h2v5h-2zm9 13H4V9h5c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2h5z"></path>
                        <circle cx="9" cy="13.5" r="1.5"></circle>
                        <path d="M11.08 16.18c-.64-.28-1.34-.43-2.08-.43s-1.44.15-2.08.43c-.56.24-.92.78-.92 1.39V18h6v-.43c0-.61-.36-1.15-.92-1.39"></path>
                      </svg>
                    </span>
                    <input
                      type="text"
                      placeholder="ali_82"
                      className="w-full p-3.5 bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-300 ltr text-right"
                      name="user"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 flex flex-col">
                  <label className="text-xs font-bold text-slate-500 mr-1">
                    ایمیل
                  </label>
                  <div className="flex items-center bg-slate-50 border-2 rounded-2xl px-4 transition-all duration-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10 border-slate-100 focus-within:border-blue-500">
                    <span className="text-slate-400">
                      <svg
                        className="w-6 h-6"
                        focusable="false"
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 14H4V8l8 5 8-5zm-8-7L4 6h16z"></path>
                      </svg>
                    </span>
                    <input
                      type="text"
                      placeholder="mail@site.com"
                      className="w-full p-3.5 bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-300 ltr text-right"
                      name="email"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 relative">
                  <div className="space-y-1.5 flex flex-col">
                    <label className="text-xs font-bold text-slate-500 mr-1">
                      رمز عبور
                    </label>
                    <div className="flex items-center bg-slate-50 border-2 rounded-2xl px-4 transition-all duration-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10 border-slate-100 focus-within:border-blue-500">
                      <span className="text-slate-400">
                        <svg
                          className="w-6 h-6"
                          focusable="false"
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                        >
                          <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2M9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9zm9 14H6V10h12zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2"></path>
                        </svg>
                      </span>
                      <input
                        type="password"
                        placeholder="حداقل ۶ کاراکتر"
                        className="w-full p-3.5 bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-300 ltr text-right"
                        name="password"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    className="absolute left-4 top-[38px] text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      focusable="false"
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5M12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5m0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3"></path>
                    </svg>
                  </button>
                </div>

                <button
                  type="submit"
                  className="md:col-span-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-bold text-xl shadow-xl shadow-blue-200 hover:shadow-blue-300 hover:scale-[1.01] active:scale-[0.98] transition-all mt-4 flex items-center justify-center gap-2"
                >
                 ایجاد حساب کاربری
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
