type ProfileSummaryProps = {
  user: {
    full_name?: string;
    phone?: string;
    email?: string;
    role_name?: string;
    role?: string;
  };
};

export default function ProfileSummary({ user }: ProfileSummaryProps) {
  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-lg font-black text-slate-900">اطلاعات حساب</h2>
      <dl className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
        <div className="rounded-xl bg-slate-50 p-4">
          <dt className="mb-1 font-bold text-slate-500">نام</dt>
          <dd className="font-black text-slate-900">{user.full_name || "-"}</dd>
        </div>
        <div className="rounded-xl bg-slate-50 p-4">
          <dt className="mb-1 font-bold text-slate-500">شماره موبایل</dt>
          <dd className="font-black text-slate-900">{user.phone || "-"}</dd>
        </div>
        <div className="rounded-xl bg-slate-50 p-4">
          <dt className="mb-1 font-bold text-slate-500">ایمیل</dt>
          <dd className="font-black text-slate-900">{user.email || "-"}</dd>
        </div>
        <div className="rounded-xl bg-slate-50 p-4">
          <dt className="mb-1 font-bold text-slate-500">نقش</dt>
          <dd className="font-black text-slate-900">
            {user.role_name || user.role || "-"}
          </dd>
        </div>
      </dl>
    </section>
  );
}
