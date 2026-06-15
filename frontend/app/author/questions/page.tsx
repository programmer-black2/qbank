import AuthorLayout from "@/components/layout/AuthorLayout";

export default function AuthorQuestionsPage() {
  return (
    <AuthorLayout title="سوالات من">
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-lg font-black text-slate-900">
          لیست سوالات نویسنده
        </h2>
        <p className="text-sm font-medium leading-7 text-slate-500">
          این صفحه محل اتصال لیست سوالات ثبت‌شده توسط نویسنده است.
        </p>
      </div>
    </AuthorLayout>
  );
}
