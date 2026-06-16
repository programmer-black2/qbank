"use client";

import { useEffect, useState } from "react";
import AuthGuard from "@/components/guards/AuthGuard";
import UserLayout from "@/components/layout/UserLayout";
import ProfileSummary from "@/components/profile/ProfileSummary";
import SubscriptionInfo from "@/components/profile/SubscriptionInfo";
import { getCurrentUser } from "@/services/auth/auth.api";
import {
  getCurrentSubscription,
  UserSubscription,
} from "@/services/subscription/subscription.api";

type CurrentUser = {
  full_name?: string;
  phone?: string;
  email?: string;
  role?: string;
  role_name?: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const [userData, subscriptionData] = await Promise.all([
          getCurrentUser(),
          getCurrentSubscription().catch(() => null),
        ]);

        if (isMounted) {
          setUser(userData);
          setSubscription(subscriptionData);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AuthGuard>
      <UserLayout title="پروفایل کاربر">
        {loading && (
          <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center font-bold text-slate-500">
            در حال دریافت اطلاعات حساب...
          </div>
        )}

        {!loading && user && (
          <>
            <ProfileSummary user={user} />
            <SubscriptionInfo subscription={subscription} />
          </>
        )}
      </UserLayout>
    </AuthGuard>
  );
}
