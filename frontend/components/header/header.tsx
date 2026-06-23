"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  clearStoredAuth,
  getStoredUser,
  hasValidAuthSession,
  isExamPath,
  StoredUser,
} from "@/lib/auth";
import { logoutUser } from "@/services/auth/auth.api";
import {
  getCurrentSubscription,
  UserSubscription,
} from "@/services/subscription/subscription.api";

function UserIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 7.5a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 20.25a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 4.5h10.5A3 3 0 0 1 18.75 7.5v12H8.25a3 3 0 0 0-3 3v-18Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 19.5a3 3 0 0 1 3-3h10.5" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 12a8.25 8.25 0 0 1-14.2 5.73" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12a8.25 8.25 0 0 1 14.2-5.73" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 2.75v4.5h-4.5M6.75 21.25v-4.5h4.5" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6A2.25 2.25 0 0 0 5.25 5.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 12h8.25M17.25 8.75 20.5 12l-3.25 3.25" />
    </svg>
  );
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<StoredUser | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);

  useEffect(() => {
    const syncAuthState = () => {
      if (hasValidAuthSession()) {
        setIsAuthenticated(true);
        setUser(getStoredUser());
        return;
      }

      setIsAuthenticated(false);
      setUser(null);
      setSubscription(null);

      if (!isExamPath(window.location.pathname) && localStorage.getItem("refresh")) {
        clearStoredAuth();
      }
    };

    syncAuthState();
    window.addEventListener("storage", syncAuthState);
    window.addEventListener("auth-changed", syncAuthState);
    window.addEventListener("focus", syncAuthState);

    return () => {
      window.removeEventListener("storage", syncAuthState);
      window.removeEventListener("auth-changed", syncAuthState);
      window.removeEventListener("focus", syncAuthState);
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    let isMounted = true;

    getCurrentSubscription()
      .then((data) => {
        if (isMounted) setSubscription(data);
      })
      .catch(() => {
        if (isMounted) setSubscription(null);
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const handleLogout = async () => {
    const refresh = localStorage.getItem("refresh");

    try {
      if (refresh) {
        await logoutUser(refresh);
      }
    } finally {
      clearStoredAuth();
      if (!isExamPath(pathname)) {
        router.push("/");
      }
    }
  };

  const remainingDays = subscription?.remaining_days ?? 0;
  const hasActiveSubscription = subscription?.status === "active" && remainingDays > 0;

  return (
    <nav className="sticky top-0 z-[100] w-full border-b border-slate-100 bg-white/90 shadow-sm shadow-slate-100/50 backdrop-blur-xl" dir="rtl">
      <div className="w-full px-40">
        <div className="flex h-20 w-full items-center justify-between gap-5">
          <div className="flex min-w-0 flex-1 items-center justify-start gap-8">
            <Link className="flex shrink-0 items-center" href="/" aria-label="صفحه اصلی دنتست">
              <Image
                alt="دنتست"
                width={150}
                height={25}
                src="/images/LogoHeader.jpg"
                className="h-auto w-[132px] object-contain sm:w-[150px]"
              />
            </Link>

            <div className="hidden items-center gap-7 lg:flex">
              <Link className="text-sm font-bold text-slate-600 transition-colors hover:text-blue-600" href="/category">
                مشاهده دروس
              </Link>
              <Link className="text-sm font-bold text-slate-600 transition-colors hover:text-blue-600" href="/subscription">
                اشتراک‌ها
              </Link>
              <Link className="text-sm font-bold text-slate-600 transition-colors hover:text-blue-600" href="/category/علوم-پایه-1">
                علوم پایه پزشکی
              </Link>
              <Link className="text-sm font-bold text-slate-600 transition-colors hover:text-blue-600" href="/category/علوم-پایه-1">
                علوم پایه دندان‌پزشکی
              </Link>
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-end gap-3">
            {isAuthenticated ? (
              <div className="group relative">
                <button
                  type="button"
                  className="grid h-12 w-12 place-items-center rounded-2xl border border-cyan-200 bg-cyan-50 text-cyan-700 transition-all hover:border-cyan-300 hover:bg-white hover:shadow-lg hover:shadow-cyan-100"
                  aria-label="منوی حساب کاربری"
                >
                  <UserIcon />
                </button>

                <div className="invisible absolute left-0 top-full w-72 translate-y-2 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white text-right shadow-2xl shadow-slate-200/70">
                    <div className="relative overflow-hidden bg-cyan-50 p-5">
                      <div className="absolute inset-0 opacity-45 [background-image:radial-gradient(circle_at_18px_18px,#67e8f9_2px,transparent_2px)] [background-size:34px_34px]" />
                      <div className="relative">
                        <p className="text-xs font-bold text-cyan-700">
                          {user?.full_name || "دانشجوی دنتست"}
                        </p>
                        <p className="mt-3 text-3xl font-black text-cyan-700">
                          {hasActiveSubscription
                            ? `${remainingDays.toLocaleString("fa-IR")} روز`
                            : "بدون اشتراک"}
                        </p>
                        <p className="mt-2 text-sm font-medium text-slate-600">
                          {hasActiveSubscription
                            ? "از اشتراک شما باقی مانده است"
                            : "برای مشاهده سوالات اشتراک تهیه کنید"}
                        </p>
                        <Link
                          href="/subscription"
                          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-600 bg-white px-4 py-3 text-sm font-black text-cyan-700 transition-colors hover:bg-cyan-600 hover:text-white"
                        >
                          تمدید اشتراک
                          <RefreshIcon />
                        </Link>
                      </div>
                    </div>

                    <div className="py-2">
                      <Link className="block px-5 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 hover:text-blue-600" href="/profile">
                        پنل دانشجو
                      </Link>
                      <Link className="block px-5 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 hover:text-blue-600" href="/category">
                        دوره‌های من
                      </Link>
                      <Link className="block px-5 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 hover:text-blue-600" href="/subscription">
                        دوره‌های پیشنهادی من
                      </Link>
                    </div>

                    {/* <div className="border-t border-slate-100 py-2">
                      <Link className="block px-5 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 hover:text-blue-600" href="/author/login">
                        تدریس کنید
                      </Link>
                    </div> */}

                    <div className="border-t border-slate-100 p-2">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        خروج از حساب کاربری
                        <LogoutIcon />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-cyan-600 px-5 text-sm font-black text-white shadow-lg shadow-cyan-100 transition-all hover:-translate-y-0.5 hover:bg-cyan-700 sm:px-6"
                href="/login"
              >
                ورود | ثبت‌نام
              </Link>
            )}

            <Link
              className="hidden min-h-12 items-center justify-center rounded-2xl border border-slate-200 px-4 text-sm font-bold text-slate-600 transition-colors hover:border-blue-100 hover:bg-blue-50 hover:text-blue-700 sm:inline-flex"
              href="/category"
            >
              <BookIcon />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
