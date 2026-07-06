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

const getChildCountLabel = (node: CategoryNode, count: number) => {
  if (node.type === "stage") return `${count} درس`;
  if (node.type === "course") return `${count} سال`;
  if (node.type === "year") return `${count} نوع آزمون`;
  return `${node.question_count ?? 0} سوال`;
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

type CategoryVisual = "basic" | "preclinical" | "clinical";

const categoryVisuals: CategoryVisual[] = ["basic", "preclinical", "clinical"];

const getCategoryVisual = (index: number): CategoryVisual =>
  categoryVisuals[index % categoryVisuals.length];

function CategoryIllustration({ visual }: { visual: CategoryVisual }) {
  if (visual === "preclinical") {
    return (
      <svg viewBox="0 0 180 140" className="h-32 w-40" aria-hidden="true">
        <circle cx="90" cy="70" r="48" fill="#ECFDF5" />
        <path
          d="M58 74c0-22 14-38 32-38s32 16 32 38c0 25-14 38-32 38S58 99 58 74Z"
          fill="#34D399"
        />
        <path
          d="M71 75c0-16 8-27 19-27s19 11 19 27c0 17-8 27-19 27S71 92 71 75Z"
          fill="#FFFFFF"
        />
        <path
          d="M90 48v54M71 76h38"
          stroke="#10B981"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M39 104h102"
          stroke="#A7F3D0"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M42 37h25M54 25v25M121 31l18 18M139 31l-18 18"
          stroke="#F59E0B"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <rect x="50" y="104" width="80" height="13" rx="6.5" fill="#D1FAE5" />
      </svg>
    );
  }

  if (visual === "clinical") {
    return (
      <svg viewBox="0 0 180 140" className="h-32 w-40" aria-hidden="true">
        <path
          d="M47 92c21-13 49-14 85-10l7 17c-38 5-71 3-99-4l7-3Z"
          fill="#60A5FA"
        />
        <path
          d="M55 82c15-22 48-34 79-26 5 1 8 6 6 11l-4 14c-35-4-64-2-89 11l8-10Z"
          fill="#2563EB"
        />
        <path
          d="M95 92v30M70 122h50"
          stroke="#1E3A8A"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M70 48c0-15 10-25 22-25 14 0 23 10 23 25 0 18-10 32-23 32S70 66 70 48Z"
          fill="#FFFFFF"
        />
        <path
          d="M92 23c-2 18-2 35 0 57"
          stroke="#BFDBFE"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M131 36h17M139 28v17"
          stroke="#F97316"
          strokeWidth="7"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 180 140" className="h-32 w-40" aria-hidden="true">
      <path
        d="M78 34h24v17l22 38c6 10-1 23-13 23H69c-12 0-19-13-13-23l22-38V34Z"
        fill="#FDBA74"
      />
      <path d="M78 34h24" stroke="#EA580C" strokeWidth="8" strokeLinecap="round" />
      <path
        d="M70 83c12-7 27 8 41 0l11 19H59l11-19Z"
        fill="#FFFFFF"
        opacity=".9"
      />
      <circle cx="76" cy="71" r="6" fill="#FB923C" />
      <circle cx="103" cy="92" r="5" fill="#FB923C" />
      <path
        d="M34 43h25M47 31v25M126 40c12 0 22 10 22 22s-10 22-22 22-22-10-22-22 10-22 22-22Z"
        stroke="#38BDF8"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M126 40v44M104 62h44"
        stroke="#BAE6FD"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CategoryCard({
  node,
  href,
  visual,
}: {
  node: CategoryNode;
  href: string;
  visual: CategoryVisual;
}) {
  const childCount = node.children?.length ?? 0;

  return (
    <Link
      href={href}
      className="group relative flex min-h-[230px] w-full flex-col items-center justify-between overflow-hidden rounded-2xl border border-slate-100 bg-white px-5 py-6 text-center shadow-[0_18px_45px_rgba(15,23,42,0.07)] transition-all duration-300 hover:-translate-y-1 hover:border-blue-100 hover:shadow-[0_24px_60px_rgba(37,99,235,0.14)] focus:outline-none focus:ring-4 focus:ring-blue-100"
    >
      <span className="absolute inset-x-10 top-4 h-20 rounded-full bg-blue-50/70 blur-3xl transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative flex flex-1 items-center justify-center">
        <CategoryIllustration visual={visual} />
      </div>

      <div className="relative w-full space-y-3">
        <h2 className="line-clamp-2 text-lg font-black leading-8 text-slate-950">
          {node.name}
        </h2>
        <div className="mx-auto h-px w-16 bg-slate-200 transition-all duration-300 group-hover:w-24 group-hover:bg-blue-300" />
        <span className="inline-flex min-h-8 items-center justify-center rounded-full bg-slate-50 px-3 text-[11px] font-black text-slate-500 ring-1 ring-slate-100">
          {childCount > 0 ? getChildCountLabel(node, childCount) : "مشاهده سوالات"}
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
          {/* <span className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700">
            بانک سؤال دنتست
          </span> */}

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
          <section className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1.5">
                <h2 className="text-lg font-black text-slate-900 md:text-xl">
                  دسته‌بندی‌های اصلی
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category, index) => (
                <CategoryCard
                  key={getNodeKey(category)}
                  node={category}
                  href={getCategoryHref([category])}
                  visual={getCategoryVisual(index)}
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
