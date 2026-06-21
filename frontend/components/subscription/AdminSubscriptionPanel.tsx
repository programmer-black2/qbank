"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminHeader from "@/components/ui/AdminHeader";
import {
  activateUserSubscription,
  AdminUser,
  createSubscriptionPlan,
  createUserSubscription,
  deactivateUserSubscription,
  deleteSubscriptionPlan,
  deleteUserSubscription,
  getAdminSubscriptionPlans,
  getAdminUsers,
  getSubscriptionStats,
  getUserSubscriptions,
  SubscriptionPlan,
  SubscriptionPlanPayload,
  SubscriptionStats,
  updateSubscriptionPlan,
  updateUserSubscription,
  UserSubscription,
  UserSubscriptionPayload,
} from "@/services/subscription/subscription.api";

type TabKey = "plans" | "subscriptions";

const emptyPlanForm: SubscriptionPlanPayload = {
  title: "",
  duration_days: 30,
  price: "0",
  discount_percent: "0",
  is_active: true,
};

const emptySubscriptionForm: UserSubscriptionPayload = {
  user_id: 0,
  subscription_plan_id: 0,
  start_date: "",
  end_date: "",
  is_active: true,
};

const toLocalInputDate = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
};

const toApiDate = (value?: string) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

const formatPrice = (value?: string) => {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("fa-IR").format(amount);
};

const formatDate = (value?: string) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
};

const getErrorMessage = (error: unknown, fallback = "خطا در ذخیره اطلاعات") => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const data = (error as { response?: { data?: unknown } }).response?.data;

    if (typeof data === "string") return data;
    if (typeof data === "object" && data !== null) {
      const record = data as Record<string, unknown>;
      const firstValue = Object.values(record)[0];

      if (Array.isArray(firstValue)) return String(firstValue[0]);
      if (typeof firstValue === "string") return firstValue;
      if (typeof record.message === "string") return record.message;
      if (typeof record.error === "string") return record.error;
      if (typeof record.detail === "string") return record.detail;
    }
  }

  return fallback;
};

const getStatusLabel = (status: UserSubscription["status"]) => {
  if (status === "active") return "فعال";
  if (status === "expired") return "منقضی";
  return "غیرفعال";
};

const getStatusClass = (status: UserSubscription["status"]) => {
  if (status === "active") return "bg-green-100 text-green-700";
  if (status === "expired") return "bg-amber-100 text-amber-700";
  return "bg-gray-100 text-gray-600";
};

export default function AdminSubscriptionPanel() {
  const [activeTab, setActiveTab] = useState<TabKey>("plans");
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [planForm, setPlanForm] = useState<SubscriptionPlanPayload>(emptyPlanForm);
  const [subscriptionForm, setSubscriptionForm] = useState<UserSubscriptionPayload>(emptySubscriptionForm);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [editingSubscription, setEditingSubscription] = useState<UserSubscription | null>(null);
  const [planSearch, setPlanSearch] = useState("");
  const [subscriptionSearch, setSubscriptionSearch] = useState("");
  const [subscriptionStatus, setSubscriptionStatus] = useState<"" | "active" | "expired" | "inactive">("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadPlans = useCallback(async () => {
    const data = await getAdminSubscriptionPlans({
      search: planSearch || undefined,
      ordering: "-created_at",
    });
    setPlans(data);
  }, [planSearch]);

  const loadSubscriptions = useCallback(async () => {
    const [subscriptionData, statsData] = await Promise.all([
      getUserSubscriptions({
        search: subscriptionSearch || undefined,
        status: subscriptionStatus || undefined,
        ordering: "-start_date",
      }),
      getSubscriptionStats(),
    ]);

    setSubscriptions(subscriptionData);
    setStats(statsData);
  }, [subscriptionSearch, subscriptionStatus]);

  const loadUsers = useCallback(async () => {
    const data = await getAdminUsers({ role: "Student", is_active: true });
    setUsers(data);
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      await Promise.all([loadPlans(), loadSubscriptions(), loadUsers()]);
    } catch (err) {
      setError(getErrorMessage(err, "خطا در دریافت اطلاعات اشتراک"));
    } finally {
      setLoading(false);
    }
  }, [loadPlans, loadSubscriptions, loadUsers]);

  useEffect(() => {
    const timeoutId = window.setTimeout(loadData, 250);
    return () => window.clearTimeout(timeoutId);
  }, [loadData]);

  const activePlans = useMemo(() => plans.filter((plan) => plan.is_active), [plans]);

  const resetPlanForm = () => {
    setEditingPlan(null);
    setPlanForm(emptyPlanForm);
    setError("");
  };

  const resetSubscriptionForm = () => {
    setEditingSubscription(null);
    setSubscriptionForm(emptySubscriptionForm);
    setError("");
  };

  const handlePlanSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (editingPlan) {
        await updateSubscriptionPlan(editingPlan.id, planForm);
      } else {
        await createSubscriptionPlan(planForm);
      }

      resetPlanForm();
      await loadPlans();
    } catch (err) {
      setError(getErrorMessage(err, "خطا در ذخیره پلن اشتراک"));
    } finally {
      setSaving(false);
    }
  };

  const handleEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setPlanForm({
      title: plan.title,
      duration_days: plan.duration_days,
      price: plan.price,
      discount_percent: plan.discount_percent,
      is_active: plan.is_active,
    });
    setError("");
    setActiveTab("plans");
  };

  const handleDeletePlan = async (plan: SubscriptionPlan) => {
    if (!window.confirm(`پلن ${plan.title} حذف شود؟`)) return;

    try {
      setError("");
      await deleteSubscriptionPlan(plan.id);
      await loadPlans();
    } catch (err) {
      setError(getErrorMessage(err, "خطا در حذف پلن اشتراک"));
    }
  };

  const handleTogglePlan = async (plan: SubscriptionPlan) => {
    try {
      setError("");
      await updateSubscriptionPlan(plan.id, { is_active: !plan.is_active });
      await loadPlans();
    } catch (err) {
      setError(getErrorMessage(err, "خطا در تغییر وضعیت پلن"));
    }
  };

  const handleSubscriptionSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!subscriptionForm.user_id || !subscriptionForm.subscription_plan_id) {
      setError("کاربر و پلن اشتراک را انتخاب کنید");
      return;
    }

    const payload: UserSubscriptionPayload = {
      user_id: Number(subscriptionForm.user_id),
      subscription_plan_id: Number(subscriptionForm.subscription_plan_id),
      start_date: toApiDate(subscriptionForm.start_date),
      end_date: toApiDate(subscriptionForm.end_date),
      is_active: subscriptionForm.is_active,
    };

    try {
      setSaving(true);
      setError("");

      if (editingSubscription) {
        await updateUserSubscription(editingSubscription.id, payload);
      } else {
        await createUserSubscription(payload);
      }

      resetSubscriptionForm();
      await loadSubscriptions();
    } catch (err) {
      setError(getErrorMessage(err, "خطا در ذخیره اشتراک کاربر"));
    } finally {
      setSaving(false);
    }
  };

  const handleEditSubscription = (subscription: UserSubscription) => {
    setEditingSubscription(subscription);
    setSubscriptionForm({
      user_id: subscription.user_id,
      subscription_plan_id: subscription.subscription_plan_id,
      start_date: toLocalInputDate(subscription.start_date),
      end_date: toLocalInputDate(subscription.end_date),
      is_active: subscription.is_active,
    });
    setError("");
    setActiveTab("subscriptions");
  };

  const handleToggleSubscription = async (subscription: UserSubscription) => {
    try {
      setError("");
      if (subscription.status === "active") {
        await deactivateUserSubscription(subscription.id);
      } else {
        await activateUserSubscription(subscription.id);
      }
      await loadSubscriptions();
    } catch (err) {
      setError(getErrorMessage(err, "خطا در تغییر وضعیت اشتراک"));
    }
  };

  const handleDeleteSubscription = async (subscription: UserSubscription) => {
    if (!window.confirm(`اشتراک ${subscription.user_full_name} حذف شود؟`)) return;

    try {
      setError("");
      await deleteUserSubscription(subscription.id);
      await loadSubscriptions();
    } catch (err) {
      setError(getErrorMessage(err, "خطا در حذف اشتراک"));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-right">
      <AdminHeader
        title="مدیریت نوع اشتراک"
        subtitle="ساخت پلن، ویرایش قیمت و مدت، مشاهده اشتراک کاربران و کنترل وضعیت فعال بودن"
        backHref="/admin/dashboard"
        backLabel="بازگشت به داشبورد"
      />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold text-gray-500">کل اشتراک‌ها</p>
            <p className="mt-2 text-2xl font-black text-gray-900">{stats?.total ?? "-"}</p>
          </div>
          <div className="rounded-lg border border-green-100 bg-green-50 p-4">
            <p className="text-xs font-bold text-green-700">فعال</p>
            <p className="mt-2 text-2xl font-black text-green-800">{stats?.active ?? "-"}</p>
          </div>
          <div className="rounded-lg border border-amber-100 bg-amber-50 p-4">
            <p className="text-xs font-bold text-amber-700">منقضی</p>
            <p className="mt-2 text-2xl font-black text-amber-800">{stats?.expired ?? "-"}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold text-gray-500">پلن‌های فعال</p>
            <p className="mt-2 text-2xl font-black text-gray-900">{activePlans.length}</p>
          </div>
        </div>

        <div className="mb-6 flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab("plans")}
            className={`flex-1 rounded-md px-4 py-2.5 text-sm font-bold transition-colors ${
              activeTab === "plans" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            پلن‌های اشتراک
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("subscriptions")}
            className={`flex-1 rounded-md px-4 py-2.5 text-sm font-bold transition-colors ${
              activeTab === "subscriptions" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            اشتراک کاربران
          </button>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        {activeTab === "plans" ? (
          <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
            <form onSubmit={handlePlanSubmit} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-1 text-lg font-bold text-gray-900">
                {editingPlan ? "ویرایش پلن" : "ساخت پلن جدید"}
              </h2>
              <p className="mb-5 text-sm text-gray-500">عنوان، مدت، قیمت و تخفیف پلن را تنظیم کنید.</p>

              <div className="space-y-4">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-gray-700">عنوان پلن</span>
                  <input
                    value={planForm.title}
                    onChange={(event) => setPlanForm((prev) => ({ ...prev, title: event.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-gray-700">مدت اشتراک به روز</span>
                  <input
                    type="number"
                    min={1}
                    value={planForm.duration_days}
                    onChange={(event) => setPlanForm((prev) => ({ ...prev, duration_days: Number(event.target.value) }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-left focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    dir="ltr"
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-gray-700">قیمت</span>
                  <input
                    type="number"
                    min={0}
                    value={planForm.price}
                    onChange={(event) => setPlanForm((prev) => ({ ...prev, price: event.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-left focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    dir="ltr"
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-gray-700">درصد تخفیف</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={planForm.discount_percent}
                    onChange={(event) => setPlanForm((prev) => ({ ...prev, discount_percent: event.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-left focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    dir="ltr"
                    required
                  />
                </label>

                <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                  <input
                    type="checkbox"
                    checked={planForm.is_active}
                    onChange={(event) => setPlanForm((prev) => ({ ...prev, is_active: event.target.checked }))}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  پلن فعال باشد
                </label>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving ? "در حال ذخیره..." : editingPlan ? "ذخیره تغییرات" : "ثبت پلن"}
                </button>
                {editingPlan && (
                  <button
                    type="button"
                    onClick={resetPlanForm}
                    className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50"
                  >
                    انصراف
                  </button>
                )}
              </div>
            </form>

            <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-gray-200 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">لیست پلن‌ها</h2>
                  <p className="text-sm text-gray-500">{plans.length} پلن ثبت شده</p>
                </div>
                <input
                  value={planSearch}
                  onChange={(event) => setPlanSearch(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 sm:max-w-xs"
                  placeholder="جستجو در عنوان پلن"
                />
              </div>

              {loading ? (
                <div className="p-8 text-center text-sm font-medium text-gray-500">در حال بارگذاری...</div>
              ) : plans.length === 0 ? (
                <div className="p-8 text-center text-sm font-medium text-gray-500">پلنی ثبت نشده است.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-5 py-3 text-right text-xs font-bold text-gray-500">عنوان</th>
                        <th className="px-5 py-3 text-right text-xs font-bold text-gray-500">مدت</th>
                        <th className="px-5 py-3 text-right text-xs font-bold text-gray-500">قیمت نهایی</th>
                        <th className="px-5 py-3 text-right text-xs font-bold text-gray-500">خریدها</th>
                        <th className="px-5 py-3 text-right text-xs font-bold text-gray-500">وضعیت</th>
                        <th className="px-5 py-3 text-right text-xs font-bold text-gray-500">عملیات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {plans.map((plan) => (
                        <tr key={plan.id} className="hover:bg-gray-50">
                          <td className="px-5 py-4 text-sm font-bold text-gray-900">{plan.title}</td>
                          <td className="px-5 py-4 text-sm text-gray-600">{plan.duration_days} روز</td>
                          <td className="px-5 py-4 text-sm text-gray-600">{formatPrice(plan.final_price)} تومان</td>
                          <td className="px-5 py-4 text-sm text-gray-600">{plan.subscriptions_count || 0}</td>
                          <td className="px-5 py-4">
                            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                              plan.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                            }`}>
                              {plan.is_active ? "فعال" : "غیرفعال"}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex flex-wrap items-center gap-3">
                              <button type="button" onClick={() => handleEditPlan(plan)} className="text-sm font-bold text-blue-600 hover:text-blue-800">
                                ویرایش
                              </button>
                              <button type="button" onClick={() => handleTogglePlan(plan)} className="text-sm font-bold text-gray-600 hover:text-gray-900">
                                {plan.is_active ? "غیرفعال" : "فعال"}
                              </button>
                              <button type="button" onClick={() => handleDeletePlan(plan)} className="text-sm font-bold text-red-600 hover:text-red-800">
                                حذف
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
            <form onSubmit={handleSubscriptionSubmit} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-1 text-lg font-bold text-gray-900">
                {editingSubscription ? "ویرایش اشتراک" : "ثبت اشتراک کاربر"}
              </h2>
              <p className="mb-5 text-sm text-gray-500">کاربر و پلن را انتخاب کنید؛ تاریخ پایان در صورت خالی بودن خودکار محاسبه می‌شود.</p>

              <div className="space-y-4">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-gray-700">کاربر</span>
                  <select
                    value={subscriptionForm.user_id}
                    onChange={(event) => setSubscriptionForm((prev) => ({ ...prev, user_id: Number(event.target.value) }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value={0}>انتخاب کاربر</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.full_name} - {user.phone}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-gray-700">پلن</span>
                  <select
                    value={subscriptionForm.subscription_plan_id}
                    onChange={(event) => setSubscriptionForm((prev) => ({ ...prev, subscription_plan_id: Number(event.target.value) }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value={0}>انتخاب پلن</option>
                    {plans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.title} - {plan.duration_days} روز
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-gray-700">تاریخ شروع</span>
                  <input
                    type="datetime-local"
                    value={subscriptionForm.start_date || ""}
                    onChange={(event) => setSubscriptionForm((prev) => ({ ...prev, start_date: event.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-left focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    dir="ltr"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-gray-700">تاریخ پایان</span>
                  <input
                    type="datetime-local"
                    value={subscriptionForm.end_date || ""}
                    onChange={(event) => setSubscriptionForm((prev) => ({ ...prev, end_date: event.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-left focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    dir="ltr"
                  />
                </label>

                <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                  <input
                    type="checkbox"
                    checked={subscriptionForm.is_active}
                    onChange={(event) => setSubscriptionForm((prev) => ({ ...prev, is_active: event.target.checked }))}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  اشتراک فعال باشد
                </label>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving ? "در حال ذخیره..." : editingSubscription ? "ذخیره تغییرات" : "ثبت اشتراک"}
                </button>
                {editingSubscription && (
                  <button
                    type="button"
                    onClick={resetSubscriptionForm}
                    className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50"
                  >
                    انصراف
                  </button>
                )}
              </div>
            </form>

            <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-gray-200 p-5 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">لیست اشتراک کاربران</h2>
                  <p className="text-sm text-gray-500">{subscriptions.length} اشتراک</p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    value={subscriptionSearch}
                    onChange={(event) => setSubscriptionSearch(event.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 sm:w-64"
                    placeholder="جستجو کاربر، موبایل یا پلن"
                  />
                  <select
                    value={subscriptionStatus}
                    onChange={(event) => setSubscriptionStatus(event.target.value as typeof subscriptionStatus)}
                    className="rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">همه وضعیت‌ها</option>
                    <option value="active">فعال</option>
                    <option value="expired">منقضی</option>
                    <option value="inactive">غیرفعال</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="p-8 text-center text-sm font-medium text-gray-500">در حال بارگذاری...</div>
              ) : subscriptions.length === 0 ? (
                <div className="p-8 text-center text-sm font-medium text-gray-500">اشتراکی یافت نشد.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-5 py-3 text-right text-xs font-bold text-gray-500">کاربر</th>
                        <th className="px-5 py-3 text-right text-xs font-bold text-gray-500">پلن</th>
                        <th className="px-5 py-3 text-right text-xs font-bold text-gray-500">بازه</th>
                        <th className="px-5 py-3 text-right text-xs font-bold text-gray-500">مانده</th>
                        <th className="px-5 py-3 text-right text-xs font-bold text-gray-500">وضعیت</th>
                        <th className="px-5 py-3 text-right text-xs font-bold text-gray-500">عملیات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {subscriptions.map((subscription) => (
                        <tr key={subscription.id} className="hover:bg-gray-50">
                          <td className="px-5 py-4">
                            <div className="text-sm font-bold text-gray-900">{subscription.user_full_name}</div>
                            <div className="text-xs text-gray-500" dir="ltr">{subscription.user_phone}</div>
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-600">{subscription.plan_title}</td>
                          <td className="px-5 py-4 text-xs font-bold leading-6 text-gray-500">
                            {formatDate(subscription.start_date)} تا {formatDate(subscription.end_date)}
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-600">{subscription.remaining_days} روز</td>
                          <td className="px-5 py-4">
                            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${getStatusClass(subscription.status)}`}>
                              {getStatusLabel(subscription.status)}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex flex-wrap items-center gap-3">
                              <button type="button" onClick={() => handleEditSubscription(subscription)} className="text-sm font-bold text-blue-600 hover:text-blue-800">
                                ویرایش
                              </button>
                              <button type="button" onClick={() => handleToggleSubscription(subscription)} className="text-sm font-bold text-gray-600 hover:text-gray-900">
                                {subscription.status === "active" ? "غیرفعال" : "فعال"}
                              </button>
                              <button type="button" onClick={() => handleDeleteSubscription(subscription)} className="text-sm font-bold text-red-600 hover:text-red-800">
                                حذف
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
