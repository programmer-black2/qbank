import Link from "next/link";
import { UserSubscription } from "@/services/subscription/subscription.api";

type SubscriptionInfoProps = {
  subscription: UserSubscription | null;
};

function CrownIcon() {
  return (
    <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.75 8 4.1 3.25L12 5.75l3.15 5.5L19.25 8l-1.5 9.25H6.25L4.75 8Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 19.25h11" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 14.25h7" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 12a8.25 8.25 0 0 1-14.2 5.73" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12a8.25 8.25 0 0 1 14.2-5.73" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 2.75v4.5h-4.5M6.75 21.25v-4.5h4.5" />
    </svg>
  );
}

export default function SubscriptionInfo({ subscription }: SubscriptionInfoProps) {
  const isActive = subscription?.status === "active" && subscription.remaining_days > 0;
  const remainingDays = subscription?.remaining_days ?? 0;
  const progress = isActive
    ? Math.max(8, Math.min(100, Math.round((remainingDays / Math.max(subscription?.plan_duration_days || 365, 1)) * 100)))
    : 0;

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-blue-100 bg-white shadow-sm shadow-blue-100/50">
      <div className="absolute inset-0 bg-blue-50/60" />
      <div className="absolute inset-0 opacity-45 [background-image:radial-gradient(circle_at_18px_18px,#93c5fd_2px,transparent_2px)] [background-size:34px_34px]" />

      <div className="relative grid gap-6 p-6 md:grid-cols-[1fr_auto] md:p-7">
        <div>
          <p className="text-sm font-black text-blue-700">باقی‌مانده اشتراک</p>
          <h2 className="mt-3 text-4xl font-black text-blue-700">
            {isActive ? `${remainingDays.toLocaleString("fa-IR")} روز` : "بدون اشتراک"}
          </h2>
          <p className="mt-3 text-sm font-medium leading-7 text-blue-950/70">
            {isActive
              ? "از اشتراک شما باقی مانده است."
              : "برای مشاهده سوالات، اشتراک فعال تهیه کنید."}
          </p>

          <div className="mt-5 h-3 overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full bg-blue-600"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="mt-4 text-xs font-bold text-blue-950/60">
            تاریخ انقضا:{" "}
            {subscription?.end_date
              ? new Date(subscription.end_date).toLocaleDateString("fa-IR")
              : "-"}
          </p>
        </div>

        <div className="flex flex-col items-start justify-center border-blue-100 md:border-r md:pr-7">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-white text-blue-600 shadow-lg shadow-blue-100">
            <CrownIcon />
          </div>
          <p className="mt-4 text-sm font-bold text-blue-950/70">پلن فعلی</p>
          <p className="mt-2 text-xl font-black text-blue-700">
            {subscription?.plan_title || "اشتراک فعال نیست"}
          </p>
        </div>

        <div className="md:col-span-2">
          <Link
            href="/subscription"
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-blue-600 bg-white px-6 text-sm font-black text-blue-700 transition-colors hover:bg-blue-600 hover:text-white md:w-auto"
          >
            {isActive ? "تمدید اشتراک" : "خرید اشتراک"}
            <RefreshIcon />
          </Link>
        </div>
      </div>
    </section>
  );
}
