import Link from "next/link";
import { SubscriptionPlan } from "@/services/subscription/subscription.api";

type PlanCardProps = {
  plan: SubscriptionPlan;
};

const formatPrice = (value: string) => {
  const amount = Number(value);

  if (Number.isNaN(amount)) {
    return value;
  }

  return amount.toLocaleString("fa-IR");
};

export default function PlanCard({ plan }: PlanCardProps) {
  return (
    <article className="flex h-full flex-col justify-between rounded-2xl border border-slate-100 bg-white p-6 text-right shadow-sm">
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">{plan.title}</h2>
          <p className="mt-2 text-sm font-medium text-slate-500">
            مدت اشتراک {plan.duration_days.toLocaleString("fa-IR")} روز
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <span className="text-xs font-bold text-slate-500">قیمت نهایی</span>
          <p className="mt-2 text-2xl font-black text-blue-700">
            {formatPrice(plan.final_price)} تومان
          </p>
          {Number(plan.discount_percent) > 0 && (
            <p className="mt-1 text-xs font-bold text-emerald-600">
              {Number(plan.discount_percent).toLocaleString("fa-IR")}٪ تخفیف
            </p>
          )}
        </div>
      </div>

      <Link
        href="/login?next=/subscription"
        className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700"
      >
        خرید اشتراک
      </Link>
    </article>
  );
}
