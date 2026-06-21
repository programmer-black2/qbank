'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/components/ui/AdminHeader';
import { getCurrentUser } from '@/services/auth/auth.api';
import {
  Course,
  getCourses,
  updatePublicSampleCourses,
} from '@/services/core/core.api';

interface AdminUser {
  full_name?: string;
}

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && !('response' in error)) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as {
      response?: {
        data?: {
          message?: string;
          error?: string;
          detail?: string;
        };
      };
    }).response;

    return response?.data?.message || response?.data?.error || response?.data?.detail || fallback;
  }

  return fallback;
};

export default function AdminPublicSamplesPage() {
  const router = useRouter();
  const [, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState<number | null>(null);

  const loadCourses = useCallback(async () => {
    const coursesResponse = await getCourses();
    setCourses(coursesResponse);
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
      await loadCourses();
    } catch {
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  }, [loadCourses, router]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      checkAuth();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [checkAuth]);

  const handlePublicSampleToggle = async (course: Course, checked: boolean) => {
    setError('');
    setSavingId(course.id);

    const previousCourses = courses;
    setCourses((currentCourses) =>
      currentCourses.map((item) =>
        item.id === course.id ? { ...item, is_public_sample: checked } : item
      )
    );

    try {
      await updatePublicSampleCourses({
        course_ids: [course.id],
        is_public_sample: checked,
      });
      await loadCourses();
    } catch (toggleError: unknown) {
      setCourses(previousCourses);
      setError(getApiErrorMessage(toggleError, 'خطا در تغییر وضعیت نمونه عمومی درس'));
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader
        title="درس‌های نمونه عمومی"
        subtitle="درس‌هایی را انتخاب کنید که برای کاربران بدون اشتراک نمایش داده شوند"
        backHref="/admin/dashboard"
        variant="green"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col gap-4 bg-white p-6 rounded-2xl shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-black text-gray-800">مدیریت نمایش درس‌های نمونه</h2>
            <p className="text-gray-500 text-sm mt-1">
              درس‌هایی که تیک دارند برای کاربران بدون اشتراک در بخش نمونه نمایش داده می‌شوند.
            </p>
          </div>

          <span className="inline-flex w-fit rounded-full bg-green-50 px-4 py-2 text-sm font-bold text-green-700">
            {courses.filter((course) => course.is_public_sample).length} درس فعال
          </span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {error && (
            <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {error}
            </div>
          )}

          {courses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm font-bold text-gray-500">
              هنوز درسی ثبت نشده است.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {courses.map((course) => {
                const isSaving = savingId === course.id;

                return (
                  <label
                    key={course.id}
                    className={`flex min-h-20 cursor-pointer items-center justify-between rounded-xl border p-4 text-right transition-colors ${
                      course.is_public_sample
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-100 bg-white hover:border-gray-200'
                    } ${isSaving ? 'opacity-60' : ''}`}
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-black text-gray-900">
                        {course.name_course}
                      </div>
                      <div className="mt-1 truncate text-xs font-bold text-gray-500">
                        {course.stage_name || 'بدون مقطع'}
                      </div>
                    </div>

                    <input
                      type="checkbox"
                      checked={Boolean(course.is_public_sample)}
                      disabled={isSaving}
                      onChange={(event) => handlePublicSampleToggle(course, event.target.checked)}
                      className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
