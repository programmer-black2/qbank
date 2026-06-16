"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentSubscription, UserSubscription } from "@/services/subscription/subscription.api";

type SubscriptionGuardProps = {
  children: React.ReactNode;
};

export default function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadSubscription = async () => {
      try {
        const data = await getCurrentSubscription();

        if (isMounted) {
          setSubscription(data);
        }
      } catch {
        if (isMounted) {
          setSubscription(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadSubscription();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return null;
  }

  if (!subscription || subscription.status !== "active") {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-amber-100 bg-amber-50 p-8 text-center">
        <h1 className="mb-3 text-xl font-black text-amber-800">
          برای مشاهده سوالات اشتراک فعال لازم است
        </h1>
        <p className="mb-6 text-sm font-medium leading-7 text-amber-700">
          ابتدا یکی از پلن‌های اشتراک را انتخاب کنید تا دسترسی سوالات برای حساب شما فعال شود.
        </p>
        <Link
          href="/subscription"
          className="inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700"
        >
          مشاهده پلن‌ها
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
