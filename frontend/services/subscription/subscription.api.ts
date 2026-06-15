import api from "@/lib/axios";

export type SubscriptionPlan = {
  id: number;
  title: string;
  duration_days: number;
  price: string;
  discount_percent: string;
  final_price: string;
  is_active: boolean;
  subscriptions_count?: number;
  created_at?: string;
};

export type UserSubscription = {
  id: number;
  user_id: number;
  user_full_name: string;
  user_phone: string;
  user_email?: string;
  subscription_plan_id: number;
  plan_title: string;
  plan_duration_days: number;
  start_date: string;
  end_date: string;
  remaining_days: number;
  status: "active" | "expired" | "inactive";
  is_active: boolean;
};

export const getSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  const response = await api.get("/api/subscription/plans/", {
    params: { is_active: true },
  });

  return response.data;
};

export const getCurrentSubscription = async (): Promise<UserSubscription | null> => {
  const response = await api.get("/api/subscription/user-subscriptions/current/");
  return response.data;
};
