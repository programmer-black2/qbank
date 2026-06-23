type ProfileSummaryProps = {
  user: {
    full_name?: string;
    phone?: string;
    email?: string;
    role_name?: string;
    role?: string;
  };
};

const roleLabels: Record<string, string> = {
  Student: "دانشجو",
  Writer: "نویسنده",
  Admin: "مدیر",
};

function ProfileIcon() {
  return (
    <svg className="h-9 w-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 7.5a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 20.25a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}

function InfoItem({
  label,
  value,
  dir,
}: {
  label: string;
  value?: string;
  dir?: "rtl" | "ltr";
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 transition-colors hover:bg-white">
      <dt className="text-xs font-black text-slate-400">{label}</dt>
      <dd className="mt-2 truncate text-sm font-black text-slate-900" dir={dir}>
        {value || "-"}
      </dd>
    </div>
  );
}

export default function ProfileSummary({ user }: ProfileSummaryProps) {
  const role = user.role_name || user.role || "";
  const displayRole = roleLabels[role] || role || "-";
  const displayName = user.full_name || "کاربر دنتست";

  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-sm">
      <div className="relative bg-slate-950 p-6 text-white md:p-8">
        <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_22px_22px,#38bdf8_2px,transparent_2px)] [background-size:38px_38px]" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-20 w-20 place-items-center rounded-3xl bg-white text-cyan-700 shadow-xl shadow-cyan-950/20">
              <ProfileIcon />
            </div>

            <div>
              <p className="text-xs font-black text-cyan-200">پروفایل دانشجو</p>
              <h2 className="mt-2 text-2xl font-black leading-9">{displayName}</h2>
              <p className="mt-1 text-sm font-medium text-slate-300">
                اطلاعات حساب کاربری شما در دنتست
              </p>
            </div>
          </div>

          <span className="inline-flex w-fit rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black text-cyan-100">
            {displayRole}
          </span>
        </div>
      </div>

      <dl className="grid grid-cols-1 gap-4 p-5 text-right md:grid-cols-2 md:p-6">
        <InfoItem label="نام و نام خانوادگی" value={user.full_name} />
        <InfoItem label="شماره موبایل" value={user.phone} dir="ltr" />
        <InfoItem label="ایمیل" value={user.email} dir="ltr" />
        <InfoItem label="نقش حساب" value={displayRole} />
      </dl>
    </section>
  );
}
