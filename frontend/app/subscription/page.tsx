import PublicLayout from "@/components/layout/PublicLayout";
import PlansGrid from "@/components/subscription/PlansGrid";

export default function SubscriptionPage() {
  return (
    <PublicLayout>
      <main className="px-4 py-10 text-right md:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <header className="space-y-3">
            <span className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700">
              اشتراک دنتست
            </span>
            <h1 className="text-2xl font-black leading-[1.5] text-slate-950 md:text-4xl">
              پلن مناسب خودت را انتخاب کن
            </h1>
            <p className="max-w-2xl text-sm font-medium leading-7 text-slate-500">
              مشاهده پلن‌ها عمومی است. برای فعال‌سازی و دیدن سوالات باید وارد حساب کاربری شوید.
            </p>
          </header>

          <PlansGrid />
        </div>
      </main>
    </PublicLayout>
  );
}
