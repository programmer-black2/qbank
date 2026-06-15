import Link from "next/link";
import RoleGuard from "@/components/guards/RoleGuard";

type AuthorLayoutProps = {
  children: React.ReactNode;
  title?: string;
};

export default function AuthorLayout({ children, title }: AuthorLayoutProps) {
  return (
    <RoleGuard allowedRoles={["Writer"]} loginPath="/author/login">
      <div className="min-h-screen bg-[#f8fafc] px-4 py-8 text-right md:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-[240px_1fr]">
          <aside className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <h2 className="mb-4 text-lg font-black text-slate-900">
              پنل نویسنده
            </h2>
            <nav className="space-y-2 text-sm font-bold text-slate-600">
              <Link className="block rounded-xl px-3 py-2 hover:bg-blue-50 hover:text-blue-700" href="/author">
                داشبورد
              </Link>
              <Link className="block rounded-xl px-3 py-2 hover:bg-blue-50 hover:text-blue-700" href="/author/questions/new">
                ثبت سوال
              </Link>
              <Link className="block rounded-xl px-3 py-2 hover:bg-blue-50 hover:text-blue-700" href="/author/questions">
                سوالات من
              </Link>
            </nav>
          </aside>
          <section className="space-y-6">
            <header className="rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm">
              <h1 className="text-xl font-black text-slate-900">
                {title || "پنل نویسنده"}
              </h1>
            </header>
            {children}
          </section>
        </div>
      </div>
    </RoleGuard>
  );
}
