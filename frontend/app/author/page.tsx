import AuthorLayout from "@/components/layout/AuthorLayout";

export default function AuthorDashboardPage() {
  return (
    <AuthorLayout title="داشبورد نویسنده">
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-lg font-black text-slate-900">
          محدوده دسترسی نویسنده
        </h2>
        <p className="text-sm font-medium leading-7 text-slate-500">
          نویسنده فقط برای ثبت سوال و مشاهده سوالات خودش وارد این بخش می‌شود. مدیریت کاربران، دسته‌بندی‌ها و اشتراک‌ها در اختیار ادمین باقی می‌ماند.
        </p>
      </div>
    </AuthorLayout>
  );
}
