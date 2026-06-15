import Link from "next/link";
import { UserSubscription } from "@/services/subscription/subscription.api";

type SubscriptionInfoProps = {
  subscription: UserSubscription | null;
};

export default function SubscriptionInfo({ subscription }: SubscriptionInfoProps) {
  const isActive = subscription?.status === "active";

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-black text-slate-900">وضعیت اشتراک</h2>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            isActive
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {isActive ? "فعال" : "غیرفعال"}
        </span>
      </div>

      {subscription ? (
        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="mb-1 font-bold text-slate-500">پلن</p>
            <p className="font-black text-slate-900">{subscription.plan_title}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="mb-1 font-bold text-slate-500">روزهای باقی‌مانده</p>
            <p className="font-black text-slate-900">
              {subscription.remaining_days.toLocaleString("fa-IR")} روز
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="mb-1 font-bold text-slate-500">انقضا</p>
            <p className="font-black text-slate-900">
              {new Date(subscription.end_date).toLocaleDateString("fa-IR")}
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-amber-50 p-5 text-sm font-bold leading-7 text-amber-700">
          اشتراک فعالی برای حساب شما ثبت نشده است.
        </div>
      )}

      {!isActive && (
        <Link
          href="/subscription"
          className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700"
        >
          خرید اشتراک
        </Link>
      )}
    </section>
  );
}
