import Link from "next/link";
import AdminHeader from "@/components/ui/AdminHeader";

type AuthorLayoutProps = {
  children: React.ReactNode;
  title?: string;
};

export default function AuthorLayout({ children, title }: AuthorLayoutProps) {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-right">
      <AdminHeader
        title={title || "پنل نویسنده"}
        subtitle="مدیریت سوالات و ثبت محتوای آموزشی"
        variant="blue"
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

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:grid-cols-[240px_1fr] md:px-8">
        <aside className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-lg font-black text-slate-900">
            پنل نویسنده
          </h2>
          <nav className="space-y-2 text-sm font-bold text-slate-600">
            <Link
              className="block rounded-xl px-3 py-2 hover:bg-blue-50 hover:text-blue-700"
              href="/author"
            >
              داشبورد
            </Link>
            <Link
              className="block rounded-xl px-3 py-2 hover:bg-blue-50 hover:text-blue-700"
              href="/author/questions/new"
            >
              ثبت سوال
            </Link>
            <Link
              className="block rounded-xl px-3 py-2 hover:bg-blue-50 hover:text-blue-700"
              href="/author/questions"
            >
              سوالات من
            </Link>
          </nav>
        </aside>

        <section className="space-y-6">{children}</section>
      </div>
    </div>
  );
}
