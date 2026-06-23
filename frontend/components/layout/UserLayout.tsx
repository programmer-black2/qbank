type UserLayoutProps = {
  children: React.ReactNode;
  title?: string;
};

export default function UserLayout({ children }: UserLayoutProps) {
  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 py-8 text-right md:px-8" dir="rtl">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* <div className="flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-slate-100 bg-white px-5 py-4 shadow-sm">
          <div>
            <p className="text-xs font-black text-blue-600">پنل دانشجو</p>
            <h1 className="mt-1 text-xl font-black text-slate-900">
              {title || "پنل کاربری"}
            </h1>
          </div>

          <nav className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-600">
            <Link href="/category" className="rounded-2xl px-4 py-2 transition-colors hover:bg-blue-50 hover:text-blue-700">
              دروس
            </Link>
            <Link href="/subscription" className="rounded-2xl px-4 py-2 transition-colors hover:bg-blue-50 hover:text-blue-700">
              اشتراک
            </Link>
            <Link href="/profile" className="rounded-2xl bg-blue-50 px-4 py-2 text-blue-700">
              پروفایل
            </Link>
          </nav>
        </div> */}

        {children}
      </div>
    </div>
  );
}
