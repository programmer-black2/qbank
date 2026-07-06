"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
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

type NavIconName = "home" | "book" | "chart" | "file" | "tag" | "info";

const navItems: Array<{
  label: string;
  href: string;
  icon: NavIconName;
  activeMatch?: string;
}> = [
  { label: "خانه", href: "/", icon: "home", activeMatch: "/" },
  { label: "مشاهده دروس", href: "/category", icon: "book", activeMatch: "/category" },
  { label: "آزمون", href: "/exam", icon: "chart", activeMatch: "/exam" },
  { label: "قیمت‌ها", href: "/subscription", icon: "tag", activeMatch: "/subscription" },
  { label: "درباره ما", href: "/about", icon: "info", activeMatch: "/about" },
];

function Icon({ name, className = "h-5 w-5" }: { name: NavIconName; className?: string }) {
  const paths: Record<NavIconName, ReactNode> = {
    home: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 11.5 8.25-7 8.25 7" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.75 10.25v8.5h4.5v-5h3.5v5h4.5v-8.5" />
      </>
    ),
    book: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.75 5.75A2.75 2.75 0 0 1 7.5 3h11.75v15.5H7.5a2.75 2.75 0 0 0-2.75 2.75V5.75Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.75 18.5A2.75 2.75 0 0 1 7.5 15.75h11.75" />
      </>
    ),
    chart: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 17.75h15" />
        <path strokeLinecap="round" strokeLinejoin="round" d="m5.75 14.25 4-4 3 3 5.5-6" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.5 7.25h2.75V10" />
      </>
    ),
    file: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.25 3.75h6.5l3.75 3.75v12.75H7.25A2.25 2.25 0 0 1 5 18V6a2.25 2.25 0 0 1 2.25-2.25Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.75 3.75V7.5h3.75M8.75 12h6.5M8.75 15.75h6.5" />
      </>
    ),
    tag: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 11.25 11.25 4.5h6.25v6.25L10.75 17.5 4.5 11.25Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.25 7.75h.01" />
      </>
    ),
    info: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25a8.25 8.25 0 1 0 0-16.5 8.25 8.25 0 0 0 0 16.5Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 11.25v5M12 8h.01" />
      </>
    ),
  };

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

function UserIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 7.5a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 20.25a7.5 7.5 0 0 1 15 0" />
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

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
    </svg>
  );
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<StoredUser | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [hideForHeroTitle, setHideForHeroTitle] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  useEffect(() => {
    if (pathname !== "/") {
      return;
    }

    let frameId = 0;

    const updateHeaderVisibility = () => {
      window.cancelAnimationFrame(frameId);

      frameId = window.requestAnimationFrame(() => {
        const heroTitle = document.getElementById("home-hero-title");

        if (!heroTitle) {
          setHideForHeroTitle(false);
          return;
        }

        const titleTop = heroTitle.getBoundingClientRect().top;
        setHideForHeroTitle(window.scrollY > 24 && titleTop <= 112);
      });
    };

    updateHeaderVisibility();
    window.addEventListener("scroll", updateHeaderVisibility, { passive: true });
    window.addEventListener("resize", updateHeaderVisibility);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", updateHeaderVisibility);
      window.removeEventListener("resize", updateHeaderVisibility);
    };
  }, [pathname]);

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
  const shouldHideHeader = pathname === "/" && hideForHeroTitle && !mobileMenuOpen;
  const activeNavLabel =
    navItems.find((item) =>
      item.activeMatch === "/" ? pathname === "/" : pathname.startsWith(item.activeMatch || item.href)
    )?.label || "منو";

  return (
    <nav
      className={`sticky top-0 z-[100] w-full bg-transparent py-3 transition-all duration-500 ease-out ${
        shouldHideHeader
          ? "pointer-events-none -translate-y-full opacity-0"
          : "translate-y-0 opacity-100"
      }`}
      dir="rtl"
    >
      <div className="mx-auto w-full max-w-[90rem] px-3 sm:px-6 lg:px-8">
        <div className="relative flex min-h-16 w-full items-center justify-between gap-3 rounded-xl border border-blue-100 bg-white/95 px-3 shadow-lg shadow-blue-950/10 backdrop-blur-xl sm:px-5 md:px-6">
          <div className="flex min-w-0 flex-1 items-center justify-start gap-4 lg:gap-8">
            <Link className="flex shrink-0 items-center" href="/" aria-label="صفحه اصلی دنتست">
              <Image
                alt="دنتست"
                width={150}
                height={25}
                src="/images/LogoHeader.jpg"
                className="h-auto w-[104px] object-contain sm:w-[128px] lg:w-[140px]"
              />
            </Link>

            <div className="hidden items-center gap-7 lg:flex">
              {navItems.map((item) => {
                const isActive =
                  item.activeMatch === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.activeMatch || item.href);

                return (
                  <Link
                    key={item.href}
                    className={`relative flex items-center gap-2 py-5 text-sm font-bold transition-colors ${
                      isActive ? "text-blue-700" : "text-blue-950/70 hover:text-blue-700"
                    }`}
                    href={item.href}
                  >
                    <Icon name={item.icon} />
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-0 right-0 h-1 w-full rounded-t-full bg-blue-600" />
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="relative lg:hidden">
              <button
                type="button"
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-header-menu"
                onClick={() => setMobileMenuOpen((open) => !open)}
                className="inline-flex h-11 min-w-[8.5rem] items-center justify-between gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-4 text-sm font-black text-blue-700 transition-colors hover:bg-blue-100"
              >
                <span className="truncate">{activeNavLabel}</span>
                <ChevronIcon open={mobileMenuOpen} />
              </button>
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-3">
            {isAuthenticated ? (
              <div className="group relative">
                <button
                  type="button"
                  className="grid h-11 w-11 place-items-center rounded-2xl border border-blue-200 bg-blue-50 text-blue-700 transition-all hover:border-blue-300 hover:bg-white hover:shadow-lg hover:shadow-blue-100 sm:h-12 sm:w-12"
                  aria-label="منوی حساب کاربری"
                >
                  <UserIcon />
                </button>

                <div className="invisible absolute left-0 top-full w-72 translate-y-2 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  <div className="overflow-hidden rounded-3xl border border-blue-100 bg-white text-right shadow-2xl shadow-blue-100/80">
                    <div className="relative overflow-hidden bg-blue-50 p-5">
                      <div className="absolute inset-0 opacity-45 [background-image:radial-gradient(circle_at_18px_18px,#93c5fd_2px,transparent_2px)] [background-size:34px_34px]" />
                      <div className="relative">
                        <p className="text-xs font-bold text-blue-700">
                          {user?.full_name || "دانشجوی دنتست"}
                        </p>
                        <p className="mt-3 text-3xl font-black text-blue-700">
                          {hasActiveSubscription
                            ? `${remainingDays.toLocaleString("fa-IR")} روز`
                            : "بدون اشتراک"}
                        </p>
                        <p className="mt-2 text-sm font-medium text-blue-950/70">
                          {hasActiveSubscription
                            ? "از اشتراک شما باقی مانده است"
                            : "برای مشاهده سوالات اشتراک تهیه کنید"}
                        </p>
                        <Link
                          href="/subscription"
                          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-600 bg-white px-4 py-3 text-sm font-black text-blue-700 transition-colors hover:bg-blue-600 hover:text-white"
                        >
                          تمدید اشتراک
                          <RefreshIcon />
                        </Link>
                      </div>
                    </div>

                    <div className="py-2">
                      <Link className="block px-5 py-3 text-sm font-bold text-blue-950 transition-colors hover:bg-blue-50 hover:text-blue-700" href="/profile">
                        پنل دانشجو
                      </Link>
                      <Link className="block px-5 py-3 text-sm font-bold text-blue-950 transition-colors hover:bg-blue-50 hover:text-blue-700" href="/category">
                        دوره‌های من
                      </Link>
                      <Link className="block px-5 py-3 text-sm font-bold text-blue-950 transition-colors hover:bg-blue-50 hover:text-blue-700" href="/subscription">
                        دوره‌های پیشنهادی من
                      </Link>
                    </div>

                    <div className="border-t border-blue-100 p-2">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-sm font-bold text-blue-950 transition-colors hover:bg-blue-50 hover:text-blue-700"
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
                className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-blue-600 px-4 text-xs font-black text-white shadow-lg shadow-blue-100 transition-all hover:-translate-y-0.5 hover:bg-blue-700 sm:min-h-12 sm:px-6 sm:text-sm"
                href="/login"
              >
                <span className="sm:hidden">ورود</span>
                <span className="hidden sm:inline">ورود | ثبت‌نام</span>
              </Link>
            )}
          </div>

          <div
            id="mobile-header-menu"
            className={`absolute left-3 right-3 top-[calc(100%+0.75rem)] overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-2xl shadow-blue-100/80 transition-all duration-200 lg:hidden ${
              mobileMenuOpen
                ? "visible translate-y-0 opacity-100"
                : "invisible -translate-y-2 opacity-0"
            }`}
          >
            <div className="grid gap-1 p-2">
              {navItems.map((item) => {
                const isActive =
                  item.activeMatch === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.activeMatch || item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-black transition-colors ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-blue-950 hover:bg-blue-50 hover:text-blue-700"
                    }`}
                  >
                    <span>{item.label}</span>
                    <Icon name={item.icon} />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
