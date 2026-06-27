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

function UserAvatarIcon() {
  return (
    <svg className="h-20 w-20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 7.5a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 20.25a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.75 6.75h14.5v10.5H4.75z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 7.25 6.75 5.5 6.75-5.5" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.25 4.75 9.5 4l2.1 4.55-1.85 1.2a11.3 11.3 0 0 0 4.5 4.5l1.2-1.85L20 14.5l-.75 2.25c-.35 1.04-1.34 1.72-2.43 1.6C10.75 17.7 6.3 13.25 5.65 7.18c-.12-1.09.56-2.08 1.6-2.43Z" />
    </svg>
  );
}

export default function ProfileSummary({ user }: ProfileSummaryProps) {
  const role = user.role_name || user.role || "";
  const displayRole = roleLabels[role] || role || "دانشجو";
  const displayName = user.full_name || "کاربر دنتست";

  return (
    <section className="rounded-[28px] border border-blue-100 bg-white p-6 shadow-sm shadow-blue-100/50">
      <div className="flex flex-col items-center gap-6 text-center md:flex-row md:text-right">
        <div className="relative">
          <div className="grid h-36 w-36 place-items-center rounded-full border-4 border-blue-100 bg-blue-50 text-blue-600 shadow-lg shadow-blue-100">
            <UserAvatarIcon />
          </div>
          <span className="absolute bottom-3 left-2 grid h-8 w-8 place-items-center rounded-full bg-blue-600 text-white shadow-md shadow-blue-100">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="m9.55 17.3-4.2-4.2 1.4-1.4 2.8 2.8 7.7-7.7 1.4 1.4z" />
            </svg>
          </span>
        </div>

        <div className="flex-1">
          <div className="flex flex-col items-center gap-3 md:items-start">
            <p className="rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-black text-blue-700">
              {displayRole}
            </p>
            <h2 className="text-3xl font-black leading-10 text-blue-950">
              {displayName}
            </h2>
            <p className="text-sm font-bold text-blue-700">
              دانشجوی دنتست
            </p>
          </div>

          <div className="mt-6 grid gap-3 text-sm font-medium text-blue-950/70">
            <div className="flex items-center justify-center gap-2 md:justify-start">
              <MailIcon />
              <span dir="ltr">{user.email || "ایمیل ثبت نشده"}</span>
            </div>
            <div className="flex items-center justify-center gap-2 md:justify-start">
              <PhoneIcon />
              <span dir="ltr">{user.phone || "شماره ثبت نشده"}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-blue-600 px-7 text-sm font-black text-white shadow-lg shadow-blue-100 transition-colors hover:bg-blue-700"
        >
          ویرایش پروفایل
        </button>
      </div>
    </section>
  );
}
