"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminHeader from "@/components/ui/AdminHeader";
import RoleGuard from "@/components/guards/RoleGuard";
import { logoutUser } from "@/services/auth/auth.api";

type AuthorLayoutProps = {
  children: React.ReactNode;
  title?: string;
};

export default function AuthorLayout({ children, title }: AuthorLayoutProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh");
      if (refreshToken) {
        await logoutUser(refreshToken);
      }
    } finally {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("user");
      router.push("/author/login");
    }
  };

  return (
    <RoleGuard allowedRoles={["Writer"]} loginPath="/author/login">
      <div className="min-h-screen bg-gray-50 text-right">
        <AdminHeader
          title={title || "پنل نویسنده"}
          subtitle="مدیریت سوالات و پیگیری وضعیت بررسی"
          variant="blue"
          onLogout={handleLogout}
          actions={
            <>
              <Link
                className="inline-flex items-center justify-center rounded-full border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                href="/author/questions"
              >
                سوالات من
              </Link>
              <Link
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-3 py-2 text-xs font-bold text-white shadow-lg shadow-blue-100 transition-colors hover:bg-blue-700"
                href="/author/questions/new"
              >
                ثبت سوال
              </Link>
            </>
          }
        />

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </RoleGuard>
  );
}
