"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AuthGuard from "@/components/guards/AuthGuard";
import { hasValidAuthSession } from "@/lib/auth";
import { CategoryNode, getCategoryTree } from "@/services/core/core.api";
import { getCurrentSubscription } from "@/services/subscription/subscription.api";

type CategorySearchResult = {
  node: CategoryNode;
  path: CategoryNode[];
};

const typeLabels: Record<CategoryNode["type"], string> = {
  stage: "مقطع",
  course: "درس",
  year: "سال",
  exam_type: "نوع آزمون",
};

const typeStyles: Record<CategoryNode["type"], string> = {
  stage: "border-blue-100 bg-blue-50 text-blue-700",
  course: "border-emerald-100 bg-emerald-50 text-emerald-700",
  year: "border-violet-100 bg-violet-50 text-violet-700",
  exam_type: "border-amber-100 bg-amber-50 text-amber-700",
};

const getNodeKey = (node: CategoryNode) => `${node.type}-${node.id}`;

const toSlug = (value: string) =>
  value
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\u0600-\u06FF\w-]/g, "");

const getRootSegment = (node: CategoryNode) => `${toSlug(node.name)}-${node.id}`;

const getCategoryHref = (path: CategoryNode[]) => {
  const [root, ...children] = path;

  if (!root) {
    return "/category";
  }

  return `/category/${[getRootSegment(root), ...children.map((node) => node.id)].join("/")}`;
};

const flattenCategoryTree = (
  nodes: CategoryNode[],
  parentPath: CategoryNode[] = []
): CategorySearchResult[] => {
  return nodes.flatMap((node) => {
    const path = [...parentPath, node];
    return [{ node, path }, ...flattenCategoryTree(node.children ?? [], path)];
  });
};

function CategoryCard({ node, href }: { node: CategoryNode; href: string }) {
  const childCount = node.children?.length ?? 0;

  return (
    <Link
      href={href}
      className="group flex min-h-28 w-full flex-col justify-between rounded-xl border border-slate-100 bg-white p-4 text-right shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg"
    >
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${
              typeStyles[node.type]
            }`}
          >
            {typeLabels[node.type]}
          </span>

          {node.type === "exam_type" && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
              {node.question_count ?? 0} سوال
            </span>
          )}
        </div>

        <h2 className="text-base font-black leading-7 text-slate-900">
          {node.name}
        </h2>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] font-bold">
        <span className={childCount > 0 ? "text-slate-500" : "text-slate-400"}>
          {childCount > 0 ? `${childCount} درس` : "مشاهده سوالات"}
        </span>
        <span className="text-blue-600 transition-transform group-hover:-translate-x-1">
          مشاهده
        </span>
      </div>
    </Link>
  );
}

export default function CategoryPage() {
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return [];
    }

    return flattenCategoryTree(categories)
      .filter(({ node }) => node.name.toLowerCase().includes(query))
      .slice(0, 12);
  }, [categories, searchQuery]);

  const isLockedPath = (path: CategoryNode[]) => {
    if (hasActiveSubscription) return false;

    const course = path.find((node) => node.type === "course");
    return Boolean(course && course.metadata?.is_public_sample !== true);
  };

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      if (!hasValidAuthSession()) {
        return;
      }

      try {
        setLoading(true);
        setError("");
        const data = await getCategoryTree();

        if (isMounted) {
          setCategories(data);
        }
      } catch {
        if (isMounted) {
          setError("دریافت دسته‌بندی‌ها با خطا مواجه شد.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadSubscription = async () => {
      try {
        const subscription = await getCurrentSubscription();
        if (isMounted) {
          setHasActiveSubscription(subscription?.status === "active");
        }
      } catch {
        if (isMounted) {
          setHasActiveSubscription(false);
        }
      }
    };

    loadSubscription();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AuthGuard>
      <main className="min-h-screen bg-[#f8fafc] px-4 py-8 text-right md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="space-y-3">
          <span className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700">
            بانک سؤال دنتست
          </span>

          <h1 className="text-2xl font-black leading-[1.5] text-slate-950 md:text-4xl">
            دسته‌بندی سوالات
          </h1>
 
        </header>

        <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <label
            htmlFor="category-search"
            className="mb-2 block text-xs font-bold text-slate-600"
          >
            جست‌وجوی عنوان دسته‌بندی و عنوان دروس
          </label>
          <input
            id="category-search"
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="مثلا علوم پایه ، وصایا ، تربیت بدنی و..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-300 focus:bg-white"
          />

          {searchQuery.trim() && (
            <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
              {searchResults.length > 0 ? (
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
                  {searchResults.map(({ node, path }) => {
                    const locked = isLockedPath(path);
                    const className = `rounded-xl border px-3 py-3 text-right transition-colors ${
                      locked
                        ? "cursor-not-allowed border-slate-100 bg-slate-100 text-slate-400"
                        : "border-slate-100 bg-white hover:border-blue-200 hover:text-blue-700"
                    }`;
                    const content = (
                      <>
                        <span className="block text-sm font-black text-slate-800">
                          {node.name}
                        </span>
                        <span className="mt-1 block truncate text-[11px] font-bold text-slate-400">
                          {path.map((item) => item.name).join(" / ")}
                        </span>
                        {locked && (
                          <span className="mt-2 inline-flex rounded-full bg-slate-200 px-2 py-1 text-[10px] font-black text-slate-600">
                            قفل - نیازمند اشتراک
                          </span>
                        )}
                      </>
                    );

                    return locked ? (
                      <div key={path.map(getNodeKey).join(">")} className={className}>
                        {content}
                      </div>
                    ) : (
                      <Link
                        key={path.map(getNodeKey).join(">")}
                        href={getCategoryHref(path)}
                        className={className}
                      >
                        {content}
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm font-bold text-slate-500">
                  نتیجه‌ای برای این عنوان پیدا نشد.
                </p>
              )}
            </div>
          )}
        </section>

        {loading && (
          <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600"></div>
            <p className="font-bold text-slate-600">در حال دریافت دسته‌بندی‌ها...</p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
            <h2 className="mb-2 text-lg font-black text-red-700">
              خطا در دریافت اطلاعات
            </h2>
            <p className="font-medium text-red-600">{error}</p>
          </div>
        )}

        {!loading && !error && categories.length === 0 && (
          <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center shadow-sm">
            <h2 className="mb-2 text-xl font-black text-slate-800">
              هنوز دسته‌بندی‌ای ثبت نشده است
            </h2>
            <p className="font-medium text-slate-500">
              پس از ثبت دسته‌بندی‌ها در پنل مدیریت، اینجا نمایش داده می‌شوند.
            </p>
          </div>
        )}

        {!loading && !error && categories.length > 0 && (
          <section className="rounded-2xl border border-slate-100 bg-white/70 p-4 shadow-sm backdrop-blur md:p-5">
            <div className="mb-4 space-y-1.5 border-b border-slate-100 pb-4">
              <h2 className="text-lg font-black text-slate-900 md:text-xl">
                دسته‌بندی‌های اصلی
              </h2>
              <p className="text-xs font-medium leading-6 text-slate-500">
               
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {categories.map((category) => (
                <CategoryCard
                  key={getNodeKey(category)}
                  node={category}
                  href={getCategoryHref([category])}
                />
              ))}
            </div>
          </section>
        )}
      </div>
      </main>
    </AuthGuard>
  );
}
