"use client";

import { useEffect, useState } from "react";
import { getSiteStats, SiteStats } from "@/services/home/home.api";

const formatPersianNumber = (value?: number) => {
  if (typeof value !== "number") {
    return "...";
  }

  return new Intl.NumberFormat("fa-IR").format(value);
};

export default function HomeStats() {
  const [stats, setStats] = useState<SiteStats | null>(null);

  useEffect(() => {
    let isMounted = true;

    getSiteStats()
      .then((data) => {
        if (isMounted) {
          setStats(data);
        }
      })
      .catch((error) => {
        console.error("Error loading site stats:", error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="max-w-md space-y-4 rounded-[32px] border border-white bg-white/70 p-6 shadow-xl shadow-blue-900/5 backdrop-blur-md mx-auto md:mx-0">
      <div className="flex items-center justify-between">
        <span className="font-bold text-slate-600">کاربران فعال</span>
        <span className="font-black text-blue-700">
          {formatPersianNumber(stats?.active_users)}00 نفر
        </span>
      </div>

      <div className="h-px bg-slate-100"></div>

      <div className="h-px bg-slate-100"></div>

      <div className="flex items-center justify-between">
        <span className="font-bold text-slate-600">مجموع سوالات</span>
        <span className="font-black text-blue-700">
          {formatPersianNumber(stats?.total_questions)} سوال
        </span>
      </div>
    </div>
  );
}
