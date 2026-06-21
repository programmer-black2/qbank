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

export type SubscriptionStats = {
  total: number;
  active: number;
  active_students?: number;
  expired: number;
  inactive: number;
};

export type ActiveSubscribedStudentsCount = {
  active_students: number;
};

export type SubscriptionPlanPayload = {
  title: string;
  duration_days: number;
  price: string;
  discount_percent: string;
  is_active: boolean;
};

export type UserSubscriptionPayload = {
  user_id: number;
  subscription_plan_id: number;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
};

export type AdminUser = {
  id: number;
  full_name: string;
  email?: string | null;
  phone: string;
  role_name?: string;
  is_active: boolean;
};

type ListResponse<T> = T[] | {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: T[];
};

const unwrapList = <T>(data: ListResponse<T>): T[] => {
  if (Array.isArray(data)) {
    return data;
  }

  return data.results || [];
};

export const getSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  const response = await api.get("/api/subscription/plans/", {
    params: { is_active: true },
  });

  return response.data;
};

export const getAdminSubscriptionPlans = async (params?: {
  search?: string;
  is_active?: boolean;
  ordering?: string;
}): Promise<SubscriptionPlan[]> => {
  const response = await api.get<ListResponse<SubscriptionPlan>>("/api/subscription/plans/", {
    params,
  });

  return unwrapList(response.data);
};

export const createSubscriptionPlan = async (
  payload: SubscriptionPlanPayload,
): Promise<SubscriptionPlan> => {
  const response = await api.post<SubscriptionPlan>("/api/subscription/plans/", payload);
  return response.data;
};

export const updateSubscriptionPlan = async (
  id: number,
  payload: Partial<SubscriptionPlanPayload>,
): Promise<SubscriptionPlan> => {
  const response = await api.patch<SubscriptionPlan>(`/api/subscription/plans/${id}/`, payload);
  return response.data;
};

export const deleteSubscriptionPlan = async (id: number): Promise<void> => {
  await api.delete(`/api/subscription/plans/${id}/`);
};

export const getCurrentSubscription = async (): Promise<UserSubscription | null> => {
  const response = await api.get("/api/subscription/user-subscriptions/current/");
  return response.data;
};

export const getUserSubscriptions = async (params?: {
  search?: string;
  status?: "active" | "expired" | "inactive" | "";
  subscription_plan_id?: number | "";
  ordering?: string;
}): Promise<UserSubscription[]> => {
  const response = await api.get<ListResponse<UserSubscription>>(
    "/api/subscription/user-subscriptions/",
    { params },
  );

  return unwrapList(response.data);
};

export const getSubscriptionStats = async (): Promise<SubscriptionStats> => {
  const response = await api.get<SubscriptionStats>("/api/subscription/user-subscriptions/stats/");
  return response.data;
};

export const getActiveSubscribedStudentsCount = async (): Promise<ActiveSubscribedStudentsCount> => {
  const response = await api.get<ActiveSubscribedStudentsCount>(
    "/api/subscription/user-subscriptions/active-students-count/",
  );
  return response.data;
};

export const createUserSubscription = async (
  payload: UserSubscriptionPayload,
): Promise<UserSubscription> => {
  const response = await api.post<UserSubscription>(
    "/api/subscription/user-subscriptions/",
    payload,
  );
  return response.data;
};

export const updateUserSubscription = async (
  id: number,
  payload: Partial<UserSubscriptionPayload>,
): Promise<UserSubscription> => {
  const response = await api.patch<UserSubscription>(
    `/api/subscription/user-subscriptions/${id}/`,
    payload,
  );
  return response.data;
};

export const activateUserSubscription = async (id: number): Promise<UserSubscription> => {
  const response = await api.post<UserSubscription>(
    `/api/subscription/user-subscriptions/${id}/activate/`,
  );
  return response.data;
};

export const deactivateUserSubscription = async (id: number): Promise<UserSubscription> => {
  const response = await api.post<UserSubscription>(
    `/api/subscription/user-subscriptions/${id}/deactivate/`,
  );
  return response.data;
};

export const deleteUserSubscription = async (id: number): Promise<void> => {
  await api.delete(`/api/subscription/user-subscriptions/${id}/`);
};

export const getAdminUsers = async (params?: {
  search?: string;
  role?: string;
  is_active?: boolean;
}): Promise<AdminUser[]> => {
  const response = await api.get<ListResponse<AdminUser>>("/api/users/", {
    params,
  });

  return unwrapList(response.data);
};
