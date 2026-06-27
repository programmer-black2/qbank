"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import AuthGuard from "@/components/guards/AuthGuard";
import UserLayout from "@/components/layout/UserLayout";
import ProfileSummary from "@/components/profile/ProfileSummary";
import SubscriptionInfo from "@/components/profile/SubscriptionInfo";
import { getCurrentUser } from "@/services/auth/auth.api";
import {
  getCurrentSubscription,
  UserSubscription,
} from "@/services/subscription/subscription.api";

type CurrentUser = {
  full_name?: string;
  phone?: string;
  email?: string;
  role?: string;
  role_name?: string;
};

type MiniIconType = "calendar" | "mail" | "phone" | "book" | "clipboard" | "bookmark" | "note" | "chart";

function CardIcon({ children }: { children: ReactNode }) {
  return (
    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-50 text-blue-600">
      {children}
    </span>
  );
}

function MiniIcon({ type }: { type: MiniIconType }) {
  const paths: Record<MiniIconType, ReactNode> = {
    calendar: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75v2.5M16.5 3.75v2.5M4.75 9.25h14.5M6.75 5.5h10.5A2.5 2.5 0 0 1 19.75 8v9.5A2.5 2.5 0 0 1 17.25 20H6.75a2.5 2.5 0 0 1-2.5-2.5V8a2.5 2.5 0 0 1 2.5-2.5Z" />
      </>
    ),
    mail: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.75 6.75h14.5v10.5H4.75z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 7.25 6.75 5.5 6.75-5.5" />
      </>
    ),
    phone: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.25 4.75 9.5 4l2.1 4.55-1.85 1.2a11.3 11.3 0 0 0 4.5 4.5l1.2-1.85L20 14.5l-.75 2.25c-.35 1.04-1.34 1.72-2.43 1.6C10.75 17.7 6.3 13.25 5.65 7.18c-.12-1.09.56-2.08 1.6-2.43Z" />
      </>
    ),
    book: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.75 5.75A2.75 2.75 0 0 1 7.5 3h11.75v15.5H7.5a2.75 2.75 0 0 0-2.75 2.75V5.75Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.75 18.5A2.75 2.75 0 0 1 7.5 15.75h11.75" />
      </>
    ),
    clipboard: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.75h6l.75 2.5h-7.5L9 4.75Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 6.5H5.75A1.75 1.75 0 0 0 4 8.25v10A1.75 1.75 0 0 0 5.75 20h12.5A1.75 1.75 0 0 0 20 18.25v-10a1.75 1.75 0 0 0-1.75-1.75H17" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8M8 15.5h5" />
      </>
    ),
    bookmark: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 4.75h10v15.5L12 17l-5 3.25V4.75Z" />
      </>
    ),
    note: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.25 4.75h11.5v14.5H6.25z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.75 9h6.5M8.75 12h6.5M8.75 15h4" />
      </>
    ),
    chart: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 17.75h15" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 15v-4M12 15V7.5M16.5 15v-6" />
      </>
    ),
  };

  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      {paths[type]}
    </svg>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-blue-50 py-4 last:border-b-0">
      <div className="flex items-center gap-3 text-blue-950">
        <CardIcon>{icon}</CardIcon>
        <span className="text-sm font-bold">{label}</span>
      </div>
      <span className="rounded-full bg-blue-50 px-4 py-2 text-xs font-black text-blue-700">
        {value}
      </span>
    </div>
  );
}

function PanelCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-blue-100 bg-white shadow-sm shadow-blue-100/50">
      <div className="flex items-center justify-between border-b border-blue-50 px-6 py-5">
        <h2 className="text-lg font-black text-blue-950">{title}</h2>
        <CardIcon>{icon}</CardIcon>
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

export default function ProfilePage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const [userData, subscriptionData] = await Promise.all([
          getCurrentUser(),
          getCurrentSubscription().catch(() => null),
        ]);

        if (isMounted) {
          setUser(userData);
          setSubscription(subscriptionData);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AuthGuard>
      <UserLayout>
        {loading && (
          <div className="rounded-[28px] border border-blue-100 bg-white p-10 text-center font-bold text-blue-700 shadow-sm shadow-blue-100/50">
            در حال دریافت اطلاعات حساب...
          </div>
        )}

        {!loading && user && (
          <div className="space-y-7">
            <section className="relative overflow-hidden rounded-[28px] border border-blue-100 bg-white shadow-sm shadow-blue-100/50">
              <div className="absolute inset-0 bg-blue-50/70" />
              <div className="absolute left-0 top-0 h-32 w-72 rounded-full bg-white/70 blur-2xl" />
              <div className="relative flex flex-col gap-3 px-6 py-8 md:px-8">
                <div className="flex items-center gap-3 text-sm font-bold text-blue-700">
                  <Link href="/" className="transition-colors hover:text-blue-900">
                    خانه
                  </Link>
                  <span>/</span>
                  <span>پروفایل</span>
                </div>
                <h1 className="text-3xl font-black text-blue-950">
                  پروفایل کاربری
                </h1>
              </div>
            </section>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1.4fr]">
              <SubscriptionInfo subscription={subscription} />
              <ProfileSummary user={user} />
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <PanelCard title="اطلاعات حساب" icon={<MiniIcon type="calendar" />}>
                <InfoRow icon={<MiniIcon type="calendar" />} label="تاریخ عضویت" value="ثبت شده" />
                <InfoRow icon={<MiniIcon type="mail" />} label="وضعیت ایمیل" value={user.email ? "تکمیل شده" : "ثبت نشده"} />
                <InfoRow icon={<MiniIcon type="phone" />} label="شماره موبایل" value={user.phone ? "تکمیل شده" : "ثبت نشده"} />
              </PanelCard>

              <PanelCard title="دسترسی‌های من" icon={<MiniIcon type="book" />}>
                <div className="space-y-3">
                  {[
                    { label: "دوره‌های من", href: "/category", icon: "book" as const },
                    { label: "آزمون‌های من", href: "/exam", icon: "clipboard" as const },
                    { label: "نشان‌گذاری‌ها", href: "/profile", icon: "bookmark" as const },
                    { label: "یادداشت‌ها", href: "/profile", icon: "note" as const },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="flex items-center justify-between rounded-2xl bg-blue-50 px-4 py-3 text-sm font-black text-blue-950 transition-colors hover:bg-blue-100"
                    >
                      <span>{item.label}</span>
                      <MiniIcon type={item.icon} />
                    </Link>
                  ))}
                </div>
              </PanelCard>

              <PanelCard title="عملکرد من" icon={<MiniIcon type="chart" />}>
                <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-blue-100 bg-white text-center">
                  {[
                    { label: "سوالات پاسخ داده", value: "۰" },
                    { label: "میانگین درصد آزمون", value: "۰" },
                    { label: "آزمون‌های شرکت کرده", value: "۰" },
                  ].map((item) => (
                    <div key={item.label} className="border-l border-blue-100 p-4 last:border-l-0">
                      <p className="text-xs font-bold leading-5 text-blue-950/70">
                        {item.label}
                      </p>
                      <p className="mt-3 text-2xl font-black text-blue-700">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                <Link
                  href="/profile"
                  className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-blue-600 px-6 text-sm font-black text-white shadow-lg shadow-blue-100 transition-colors hover:bg-blue-700"
                >
                  مشاهده کارنامه
                </Link>
              </PanelCard>
            </div>
          </div>
        )}
      </UserLayout>
    </AuthGuard>
  );
}
