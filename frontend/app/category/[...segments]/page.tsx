"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CategoryNode, getCategoryTree } from "@/services/core/core.api";
import {
  getStudentQuestions,
  Question,
  QuestionListResponse,
} from "@/services/question/question.api";

type ResolvedRoute = {
  path: CategoryNode[];
  node?: CategoryNode;
  isValid: boolean;
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

const normalizeSegment = (value: string) =>
  decodeURIComponent(value).trim().toLowerCase();

const getRootIdFromSegment = (segment: string) => {
  const match = normalizeSegment(segment).match(/-(\d+)$/);
  return match ? Number(match[1]) : undefined;
};

const getCategoryHref = (path: CategoryNode[]) => {
  const [root, ...children] = path;

  if (!root) {
    return "/category";
  }

  return `/category/${[getRootSegment(root), ...children.map((node) => node.id)].join("/")}`;
};

const resolveCategoryRoute = (
  categories: CategoryNode[],
  segments: string[]
): ResolvedRoute => {
  const [rootSegment, ...childSegments] = segments;

  if (!rootSegment) {
    return { path: [], isValid: false };
  }

  const rootId = getRootIdFromSegment(rootSegment);
  const rootSlug = normalizeSegment(rootSegment);
  const root = categories.find((category) => {
    return (
      category.id === rootId ||
      normalizeSegment(toSlug(category.name)) === rootSlug
    );
  });

  if (!root) {
    return { path: [], isValid: false };
  }

  const path = [root];
  let currentNode = root;

  for (const segment of childSegments) {
    const id = Number(segment);

    if (!Number.isInteger(id)) {
      return { path, node: currentNode, isValid: false };
    }

    const child = currentNode.children?.find((node) => node.id === id);

    if (!child) {
      return { path, node: currentNode, isValid: false };
    }

    path.push(child);
    currentNode = child;
  }

  return { path, node: currentNode, isValid: true };
};

const getQuestionsFromResponse = (response: QuestionListResponse | Question[]) => {
  return Array.isArray(response) ? response : response.results;
};

function CategoryCard({
  node,
  href,
}: {
  node: CategoryNode;
  href: string;
}) {
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
          {childCount > 0 ? `${childCount} سال` : "مشاهده سوالات"}
        </span>
        <span className="text-blue-600 transition-transform group-hover:-translate-x-1">
          مشاهده
        </span>
      </div>
    </Link>
  );
}

function CategoryBreadcrumb({ path }: { path: CategoryNode[] }) {
  return (
    <nav
      aria-label="مسیر دسته‌بندی"
      className="rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm"
    >
      <ol className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-600">
        <li>
          <Link href="/category" className="text-slate-500 hover:text-blue-700">
            دسته‌بندی‌ها
          </Link>
        </li>

        {path.map((item, index) => (
          <li key={getNodeKey(item)} className="flex items-center gap-2">
            <span className="text-slate-300">/</span>
            <Link
              href={getCategoryHref(path.slice(0, index + 1))}
              className={
                index === path.length - 1
                  ? "text-blue-700"
                  : "text-slate-500 hover:text-blue-700"
              }
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function QuestionCard({ question }: { question: Question }) {
  return (
    <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] font-bold">
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-700">
          {question.question_type_display || question.question_type}
        </span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
          {question.difficulty_display || question.difficulty}
        </span>
      </div>

      <p className="text-sm font-bold leading-7 text-slate-800">
        {question.question_text}
      </p>
    </article>
  );
}

export default function CategoryRoutePage() {
  const params = useParams<{ segments: string[] }>();
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [error, setError] = useState("");
  const [questionsError, setQuestionsError] = useState("");

  const resolvedRoute = useMemo(
    () => resolveCategoryRoute(categories, params.segments),
    [categories, params.segments]
  );

  const currentNode = resolvedRoute.node;
  const childNodes = currentNode?.children ?? [];
  const shouldLoadQuestions = currentNode?.type === "exam_type";

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
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

    const loadQuestions = async () => {
      if (!shouldLoadQuestions || !currentNode) {
        setQuestions([]);
        return;
      }

      if (!localStorage.getItem("access")) {
        const next = `${window.location.pathname}${window.location.search}`;
        router.push(`/login?next=${encodeURIComponent(next)}`);
        return;
      }

      try {
        setQuestionsLoading(true);
        setQuestionsError("");
        const response = await getStudentQuestions({
          exam_type_id: currentNode.id,
          page_size: 50,
        });

        if (isMounted) {
          setQuestions(getQuestionsFromResponse(response));
        }
      } catch {
        if (isMounted) {
          setQuestionsError("دریافت سوالات این دسته‌بندی با خطا مواجه شد.");
        }
      } finally {
        if (isMounted) {
          setQuestionsLoading(false);
        }
      }
    };

    loadQuestions();

    return () => {
      isMounted = false;
    };
  }, [currentNode, router, shouldLoadQuestions]);

  return (
    <main className="min-h-screen bg-[#f8fafc] px-4 py-8 text-right md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <Link href="/category" className="text-xs font-bold text-blue-700">
          بازگشت به دسته‌بندی‌ها
        </Link>

        {loading && (
          <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600"></div>
            <p className="font-bold text-slate-600">در حال دریافت دسته‌بندی...</p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
            <h1 className="mb-2 text-lg font-black text-red-700">
              خطا در دریافت اطلاعات
            </h1>
            <p className="font-medium text-red-600">{error}</p>
          </div>
        )}

        {!loading && !error && !resolvedRoute.isValid && (
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-8 text-center">
            <h1 className="mb-2 text-lg font-black text-amber-700">
              این مسیر دسته‌بندی پیدا نشد
            </h1>
            <p className="font-medium text-amber-700">
              آدرس وارد شده با ساختار فعلی دسته‌بندی‌ها سازگار نیست.
            </p>
          </div>
        )}

        {!loading && !error && resolvedRoute.isValid && currentNode && (
          <>
            <CategoryBreadcrumb path={resolvedRoute.path} />

            <header className="space-y-3">
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${
                  typeStyles[currentNode.type]
                }`}
              >
                {typeLabels[currentNode.type]}
              </span>

              <h1 className="text-2xl font-black leading-[1.5] text-slate-950 md:text-4xl">
                {currentNode.name}
              </h1>
              {/* <p className="max-w-2xl text-xs font-medium leading-6 text-slate-500 md:text-sm">
                {childNodes.length > 0
                  ? "یکی از زیرمجموعه‌ها را انتخاب کنید تا وارد روت اختصاصی آن شوید."
                  : "این شاخه به انتهای مسیر رسیده و سوالات مرتبط نمایش داده می‌شود."}
              </p> */}
            </header>

            {childNodes.length > 0 && (
              <section className="rounded-2xl border border-slate-100 bg-white/70 p-4 shadow-sm backdrop-blur md:p-5">
                <div className="mb-4 space-y-1.5 border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-black text-slate-900 md:text-xl">
                   دروس {currentNode.name}
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {childNodes.map((child) => (
                    <CategoryCard
                      key={getNodeKey(child)}
                      node={child}
                      href={getCategoryHref([...resolvedRoute.path, child])}
                    />
                  ))}
                </div>
              </section>
            )}

            {childNodes.length === 0 && currentNode.type !== "exam_type" && (
              <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-sm">
                <h2 className="mb-2 text-lg font-black text-slate-800">
                  زیرمجموعه‌ای ثبت نشده است
                </h2>
                <p className="font-medium text-slate-500">
                  برای نمایش سوالات، این شاخه باید به نوع آزمون متصل باشد.
                </p>
              </div>
            )}

            {shouldLoadQuestions && (
              <section className="rounded-2xl border border-slate-100 bg-white/70 p-4 shadow-sm backdrop-blur md:p-5">
                <div className="mb-4 space-y-1.5 border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-black text-slate-900 md:text-xl">
                    سوالات {currentNode.name}
                  </h2>
                  <p className="text-xs font-medium leading-6 text-slate-500">
                    سوالات بر اساس شناسه نوع آزمون فیلتر شده‌اند.
                  </p>
                </div>

                {questionsLoading && (
                  <div className="py-8 text-center text-sm font-bold text-slate-500">
                    در حال دریافت سوالات...
                  </div>
                )}

                {!questionsLoading && questionsError && (
                  <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-700">
                    {questionsError}
                  </div>
                )}

                {!questionsLoading && !questionsError && questions.length === 0 && (
                  <div className="rounded-xl border border-slate-100 bg-white p-8 text-center text-sm font-bold text-slate-500">
                    هنوز سوالی برای این دسته‌بندی ثبت نشده است.
                  </div>
                )}

                {!questionsLoading && !questionsError && questions.length > 0 && (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {questions.map((question) => (
                      <QuestionCard
                        key={question.id ?? question.question_text}
                        question={question}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
