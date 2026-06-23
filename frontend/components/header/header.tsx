"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { clearStoredAuth, getStoredUser, hasValidAuthSession, isExamPath, StoredUser } from "@/lib/auth";
import { logoutUser } from "@/services/auth/auth.api";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    const syncAuthState = () => {
      if (hasValidAuthSession()) {
        setIsAuthenticated(true);
        setUser(getStoredUser());
        return;
      }

      setIsAuthenticated(false);
      setUser(null);

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

  return (
    <nav className="sticky top-0 z-[100] bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center ">
            <Link className="flex items-center gap-2 group" href="/">
              <Image
                alt="logo"
                width={150}
                height={25}
                src="/images/LogoHeader.jpg"
              />
            </Link>

            <div className="hidden lg:flex items-center gap-6">
              <div className="relative py-7 group cursor-pointer">
                {/* <div className="flex items-center gap-1 text-sm font-bold transition-colors text-slate-600">
                  خدمات
                  <svg
                    className="w-5 h-5 transition-transform duration-300 group-hover:rotate-180"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
                  </svg>
                </div> */}
                <div className="absolute bottom-5 right-0 h-0.5 bg-blue-600 transition-all duration-300 w-0 group-hover:w-full" />
              </div>

              <Link
                className="flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors"
                href="/category/علوم-پایه-1"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9.68 13.69 12 11.93l2.31 1.76-.88-2.85L15.75 9h-2.84L12 6.19 11.09 9H8.25l2.31 1.84zM20 10c0-4.42-3.58-8-8-8s-8 3.58-8 8c0 2.03.76 3.87 2 5.28V23l6-2 6 2v-7.72c1.24-1.41 2-3.25 2-5.28m-8-6c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6 2.69-6 6-6m0 15-4 1.02v-3.1c1.18.68 2.54 1.08 4 1.08s2.82-.4 4-1.08v3.1z" />
                </svg>
                علوم پایه پزشکی
              </Link>

              <Link
                className="flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors"
                href="/category/علوم-پایه-1"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3 1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9zm6.82 6L12 12.72 5.18 9 12 5.28zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73z" />
                </svg>
                علوم پایه دندان پزشکی
              </Link>

              <a
                className="flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors"
                href="#"
              >
                دستیاری پزشکی
              </a>

              <a
                className="flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors"
                href="#"
              >
                پره انترنی
              </a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <Link
                    className="hidden text-sm font-bold text-slate-600 transition-colors hover:text-blue-600 sm:inline-flex"
                    href="/profile"
                  >
                    {user?.full_name || "داشبورد دانشجویی"}
                  </Link>
                  <Link
                    className="bg-blue-600 text-white text-sm font-bold px-5 py-3 rounded-2xl shadow-lg shadow-blue-100 hover:bg-blue-700 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                    href="/profile"
                  >
                    داشبورد دانشجویی
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 transition-colors hover:border-red-100 hover:bg-red-50 hover:text-red-600"
                  >
                    خروج
                  </button>
                </>
              ) : (
                <>
                  <Link
                    className="text-sm font-bold text-slate-600 hover:text-blue-600 px-4 py-2 transition-colors"
                    href="/login"
                  >
                    ورود
                  </Link>
                  <Link
                    className="bg-blue-600 text-white text-sm font-bold px-6 py-3 rounded-2xl shadow-lg shadow-blue-100 hover:bg-blue-700 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                    href="/register"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11 7 9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8z" />
                    </svg>
                    ثبت نام
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
