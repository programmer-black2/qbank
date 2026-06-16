import Link from "next/link";

type UserLayoutProps = {
  children: React.ReactNode;
  title?: string;
};

export default function UserLayout({ children, title }: UserLayoutProps) {
  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 py-8 text-right md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm">
          <h1 className="text-lg font-black text-slate-900">
            {title || "پنل کاربری"}
          </h1>
          <nav className="flex flex-wrap items-center gap-3 text-sm font-bold text-slate-600">
            <Link href="/category" className="hover:text-blue-700">
              دروس
            </Link>
            <Link href="/subscription" className="hover:text-blue-700">
              اشتراک
            </Link>
            <Link href="/profile" className="hover:text-blue-700">
              پروفایل
            </Link>
          </nav>
        </div>
        {children}
      </div>
    </div>
  );
}
