import Link from "next/link";
import { UserSubscription } from "@/services/subscription/subscription.api";

type SubscriptionInfoProps = {
  subscription: UserSubscription | null;
};

function CalendarIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75v2.5M16.5 3.75v2.5M4.75 9.25h14.5M6.75 5.5h10.5A2.5 2.5 0 0 1 19.75 8v9.5A2.5 2.5 0 0 1 17.25 20H6.75a2.5 2.5 0 0 1-2.5-2.5V8a2.5 2.5 0 0 1 2.5-2.5Z" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75 13.9 9l5.35 1.95-5.35 1.95L12 18.25l-1.9-5.35-5.35-1.95L10.1 9 12 3.75Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m18.5 16.5.75 2.1 2.1.75-2.1.75-.75 2.1-.75-2.1-2.1-.75 2.1-.75.75-2.1Z" />
    </svg>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-cyan-100 bg-white/80 p-4">
      <p className="text-xs font-black text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-black text-slate-900">{value}</p>
    </div>
  );
}

export default function SubscriptionInfo({ subscription }: SubscriptionInfoProps) {
  const isActive = subscription?.status === "active" && subscription.remaining_days > 0;
  const remainingDays = subscription?.remaining_days ?? 0;

  return (
    <section className="overflow-hidden rounded-[28px] border border-cyan-100 bg-cyan-50 shadow-sm">
      <div className="relative p-6 md:p-7">
        <div className="absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_18px_18px,#67e8f9_2px,transparent_2px)] [background-size:34px_34px]" />

        <div className="relative flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-white text-cyan-700 shadow-lg shadow-cyan-100">
              <SparkIcon />
            </div>
            <p className="text-sm font-black text-cyan-700">وضعیت اشتراک</p>
            <h2 className="mt-3 text-4xl font-black text-cyan-700">
              {isActive
                ? `${remainingDays.toLocaleString("fa-IR")} روز`
                : "غیرفعال"}
            </h2>
            <p className="mt-3 text-sm font-medium leading-7 text-slate-600">
              {isActive
                ? "از اشتراک شما باقی مانده است."
                : "برای مشاهده سوالات، یک اشتراک فعال تهیه کنید."}
            </p>
          </div>

          <span
            className={`inline-flex w-fit rounded-full px-4 py-2 text-xs font-black ${
              isActive
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {isActive ? "فعال" : "نیازمند تمدید"}
          </span>
        </div>

        <div className="relative mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
          <Metric label="پلن" value={subscription?.plan_title || "-"} />
          <Metric
            label="روزهای باقی‌مانده"
            value={isActive ? `${remainingDays.toLocaleString("fa-IR")} روز` : "-"}
          />
          <Metric
            label="تاریخ انقضا"
            value={
              subscription?.end_date
                ? new Date(subscription.end_date).toLocaleDateString("fa-IR")
                : "-"
            }
          />
        </div>

        <div className="relative mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/subscription"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-cyan-600 px-6 text-sm font-black text-white shadow-lg shadow-cyan-100 transition-all hover:bg-cyan-700 active:scale-95"
          >
            {isActive ? "تمدید اشتراک" : "خرید اشتراک"}
            <CalendarIcon />
          </Link>
          <Link
            href="/category"
            className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-cyan-200 bg-white px-6 text-sm font-black text-cyan-700 transition-colors hover:bg-cyan-50"
          >
            مشاهده دروس
          </Link>
        </div>
      </div>
    </section>
  );
}
