"use client";

import { useEffect, useState } from "react";
import PlanCard from "@/components/subscription/PlanCard";
import {
  getSubscriptionPlans,
  SubscriptionPlan,
} from "@/services/subscription/subscription.api";

export default function PlansGrid() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadPlans = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getSubscriptionPlans();

        if (isMounted) {
          setPlans(data);
        }
      } catch {
        if (isMounted) {
          setError("دریافت پلن‌های اشتراک با خطا مواجه شد.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadPlans();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center font-bold text-slate-500">
        در حال دریافت پلن‌ها...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center font-bold text-red-700">
        {error}
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center font-bold text-slate-500">
        هنوز پلن فعالی ثبت نشده است.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {plans.map((plan) => (
        <PlanCard key={plan.id} plan={plan} />
      ))}
    </div>
  );
}
