"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import AuthGuard from "@/components/guards/AuthGuard";
import { hasValidAuthSession } from "@/lib/auth";
import { CategoryNode, getCategoryTree } from "@/services/core/core.api";
import {
  getPublicQuestionAnswer,
  getPublicQuestions,
  getStudentQuestionAnswer,
  getStudentQuestions,
  Question,
  QuestionListResponse,
  reportPublicQuestion,
  reportStudentQuestion,
  StudentQuestionAnswer,
} from "@/services/question/question.api";
import { getCurrentSubscription } from "@/services/subscription/subscription.api";

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

const getChildCountLabel = (node: CategoryNode, count: number) => {
  if (node.type === "stage") return `${count} درس`;
  if (node.type === "course") return `${count} سال`;
  if (node.type === "year") return `${count} نوع آزمون`;
  return `${node.question_count ?? 0} سوال`;
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

const questionTypeLabels: Record<string, string> = {
  mcq: "تستی",
  descriptive: "تشریحی",
};

const difficultyLabels: Record<string, string> = {
  easy: "آسان",
  medium: "متوسط",
  hard: "سخت",
  unknown: "نامشخص",
};

function CategoryCard({
  node,
  href,
  locked = false,
}: {
  node: CategoryNode;
  href: string;
  locked?: boolean;
}) {
  const childCount = node.children?.length ?? 0;
  const className = `group flex min-h-28 w-full flex-col justify-between rounded-xl border p-4 text-right shadow-sm transition-all ${
    locked
      ? "cursor-not-allowed border-slate-100 bg-slate-50 opacity-80"
      : "border-slate-100 bg-white hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg"
  }`;
  const content = (
    <>
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${
              typeStyles[node.type]
            }`}
          >
            {typeLabels[node.type]}
          </span>

          {locked && (
            <span className="rounded-full bg-slate-200 px-2.5 py-1 text-[11px] font-black text-slate-600">
              قفل
            </span>
          )}

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
          {locked ? "نیازمند اشتراک" : childCount > 0 ? getChildCountLabel(node, childCount) : "مشاهده سوالات"}
        </span>
        <span className={locked ? "text-slate-400" : "text-blue-600 transition-transform group-hover:-translate-x-1"}>
          {locked ? "قفل" : "مشاهده"}
        </span>
      </div>
    </>
  );

  if (locked) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Link href={href} className={className}>{content}</Link>
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

function QuestionCard({
  question,
  questionNumber,
  hasActiveSubscription,
}: {
  question: Question;
  questionNumber: number;
  hasActiveSubscription: boolean;
}) {
  const [selectedChoiceId, setSelectedChoiceId] = useState<number | string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [answer, setAnswer] = useState<StudentQuestionAnswer | null>(null);
  const [answerLoading, setAnswerLoading] = useState(false);
  const [answerError, setAnswerError] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const [reportMessage, setReportMessage] = useState("");
  const [reportStatus, setReportStatus] = useState("");
  const correctChoice = question.choices?.find((choice) => choice.is_correct);
  const selectedChoice = question.choices?.find(
    (choice) => (choice.id ?? choice.option_number) === selectedChoiceId
  );
  const isAnswered = selectedChoiceId !== null;

  const handleShowAnswer = async () => {
    if (!question.id) return;

    setShowAnswer(true);

    if (answer || answerLoading) {
      return;
    }

    try {
      setAnswerLoading(true);
      setAnswerError("");
      const loadAnswer = hasActiveSubscription ? getStudentQuestionAnswer : getPublicQuestionAnswer;
      const data = await loadAnswer(question.id);
      setAnswer(data);
    } catch {
      setAnswerError("دریافت پاسخ با خطا مواجه شد.");
    } finally {
      setAnswerLoading(false);
    }
  };

  const handleReport = async () => {
    if (!question.id || !reportMessage.trim()) {
      setReportStatus("متن گزارش را وارد کنید.");
      return;
    }

    try {
      setReportStatus("در حال ثبت گزارش...");
      const sendReport = hasActiveSubscription ? reportStudentQuestion : reportPublicQuestion;
      await sendReport(question.id, reportMessage.trim());
      setReportStatus("گزارش با موفقیت ثبت شد.");
      setReportMessage("");
    } catch {
      setReportStatus("ثبت گزارش با خطا مواجه شد.");
    }
  };

  return (
    <article className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
          <span className="rounded-full bg-blue-600 px-3 py-1 text-white">
            سوال {questionNumber.toLocaleString("fa-IR")}
          </span>
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-700">
            {question.question_type_display || questionTypeLabels[question.question_type] || question.question_type}
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
            {question.difficulty_display || difficultyLabels[question.difficulty] || question.difficulty}
          </span>
        </div>
        {isAnswered && question.question_type === "mcq" && (
          <span
            className={`rounded-full px-3 py-1 text-xs font-black ${
              selectedChoice?.is_correct
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {selectedChoice?.is_correct ? "پاسخ درست" : "پاسخ نادرست"}
          </span>
        )}
      </div>

      <p className="text-base font-black leading-8 text-slate-900">
        {question.question_text}
      </p>

      {question.choices && question.choices.length > 0 && (
        <div className="mt-5 grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 md:grid-cols-2">
          {question.choices.map((choice) => (
            <button
              type="button"
              key={choice.id ?? choice.option_number}
              onClick={() => setSelectedChoiceId(choice.id ?? choice.option_number)}
              className={`rounded-xl border px-4 py-3 text-right text-sm font-bold leading-7 transition-colors ${
                showAnswer && correctChoice && choice.is_correct
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : showAnswer && selectedChoiceId === (choice.id ?? choice.option_number) && !choice.is_correct
                    ? "border-red-200 bg-red-50 text-red-800"
                    : selectedChoiceId === (choice.id ?? choice.option_number)
                      ? "border-blue-300 bg-blue-50 text-blue-800"
                      : "border-slate-100 bg-slate-50 text-slate-700 hover:border-blue-200 hover:bg-blue-50"
              }`}
            >
              <span className="ml-2 text-blue-700">
                گزینه {choice.option_number.toLocaleString("fa-IR")}:
              </span>
              {choice.option_text}
            </button>
          ))}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={handleShowAnswer}
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-black text-white transition-colors hover:bg-blue-700"
        >
          نمایش پاسخ
        </button>
        <button
          type="button"
          onClick={() => setReportOpen((value) => !value)}
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-black text-slate-700 transition-colors hover:bg-slate-50"
        >
          گزارش سوال
        </button>
      </div>

      {showAnswer && (
        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
          {answerLoading && <p className="text-sm font-bold text-blue-700">در حال دریافت پاسخ...</p>}
          {answerError && <p className="text-sm font-bold text-red-600">{answerError}</p>}
          {!answerLoading && !answerError && (
            <>
              {question.question_type === "mcq" && correctChoice && (
                <p className="text-sm font-black leading-7 text-emerald-700">
                  گزینه {correctChoice.option_number.toLocaleString("fa-IR")} - {correctChoice.option_text}
                </p>
              )}
              {answer?.descriptive_answer_text && (
                <p className="mt-2 text-sm font-bold leading-7 text-slate-800">
                  {answer.descriptive_answer_text}
                </p>
              )}
              {!correctChoice && !answer?.descriptive_answer_text && (
                <p className="text-sm font-bold text-slate-600">پاسخی برای این سوال ثبت نشده است.</p>
              )}
            </>
          )}
        </div>
      )}

      {reportOpen && (
        <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
          <label className="mb-2 block text-xs font-black text-slate-600">متن گزارش</label>
          <textarea
            value={reportMessage}
            onChange={(event) => setReportMessage(event.target.value)}
            rows={3}
            placeholder="مشکل سوال، گزینه‌ها یا پاسخ را بنویسید..."
            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold leading-7 text-slate-800 outline-none transition-colors focus:border-blue-300"
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleReport}
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-black text-white transition-colors hover:bg-blue-700"
            >
              ثبت گزارش
            </button>
            {reportStatus && <span className="text-xs font-bold text-slate-600">{reportStatus}</span>}
          </div>
        </div>
      )}
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
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [questionTypeFilter, setQuestionTypeFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");

  const resolvedRoute = useMemo(
    () => resolveCategoryRoute(categories, params.segments),
    [categories, params.segments]
  );

  const currentNode = resolvedRoute.node;
  const childNodes = currentNode?.children ?? [];
  const shouldLoadQuestions = currentNode?.type === "exam_type";
  const courseNode = resolvedRoute.path.find((node) => node.type === "course");
  const isCurrentCoursePublic = courseNode?.metadata?.is_public_sample === true;
  const hasCurrentCourseAccess = !courseNode || hasActiveSubscription || isCurrentCoursePublic;
  const visibleQuestions = useMemo(() => {
    return questions.filter((question) => {
      const matchesType = !questionTypeFilter || question.question_type === questionTypeFilter;
      const matchesDifficulty = !difficultyFilter || question.difficulty === difficultyFilter;
      return matchesType && matchesDifficulty;
    });
  }, [difficultyFilter, questionTypeFilter, questions]);

  const isLockedNode = (node: CategoryNode) => {
    if (hasActiveSubscription) return false;
    if (node.type === "course") return node.metadata?.is_public_sample !== true;
    if (courseNode) return !isCurrentCoursePublic;
    return false;
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

  useEffect(() => {
    let isMounted = true;

    const loadQuestions = async () => {
      if (!shouldLoadQuestions || !currentNode) {
        setQuestions([]);
        return;
      }

      if (!hasCurrentCourseAccess) {
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
        const loadQuestionList = hasActiveSubscription ? getStudentQuestions : getPublicQuestions;
        const response = await loadQuestionList({
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
  }, [currentNode, hasActiveSubscription, hasCurrentCourseAccess, router, shouldLoadQuestions]);

  return (
    <AuthGuard>
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
                      locked={isLockedNode(child)}
                    />
                  ))}
                </div>
              </section>
            )}

            {!hasCurrentCourseAccess && (
              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-6 text-center shadow-sm">
                <h2 className="text-lg font-black text-amber-800">این درس نیازمند اشتراک است</h2>
                <p className="mt-2 text-sm font-bold leading-7 text-amber-700">
                  این درس در نمونه‌های رایگان فعال نشده است. برای مشاهده سوالات و گزینه‌ها اشتراک تهیه کنید.
                </p>
                <Link
                  href="/subscription"
                  className="mt-4 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white transition-colors hover:bg-blue-700"
                >
                  مشاهده پلن‌های اشتراک
                </Link>
              </div>
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

            {shouldLoadQuestions && hasCurrentCourseAccess && (
              <section className="rounded-2xl border border-slate-100 bg-white/70 p-4 shadow-sm backdrop-blur md:p-5">
                <div className="mb-4 space-y-1.5 border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-black text-slate-900 md:text-xl">
                    سوالات {currentNode.name}
                  </h2>
                  <p className="text-xs font-medium leading-6 text-slate-500">
                    سوالات بر اساس شناسه نوع آزمون فیلتر شده‌اند.
                  </p>
                </div>

                <div className="mb-4 grid grid-cols-1 gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-black text-blue-800">نوع سوال</label>
                    <select
                      value={questionTypeFilter}
                      onChange={(event) => setQuestionTypeFilter(event.target.value)}
                      className="w-full rounded-xl border border-blue-100 bg-white px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-blue-300"
                    >
                      <option value="">همه سوالات</option>
                      <option value="mcq">تستی</option>
                      <option value="descriptive">تشریحی</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-black text-blue-800">درجه سختی</label>
                    <select
                      value={difficultyFilter}
                      onChange={(event) => setDifficultyFilter(event.target.value)}
                      className="w-full rounded-xl border border-blue-100 bg-white px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-blue-300"
                    >
                      <option value="">همه سطح‌ها</option>
                      <option value="easy">آسان</option>
                      <option value="medium">متوسط</option>
                      <option value="hard">سخت</option>
                    </select>
                  </div>
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

                {!questionsLoading && !questionsError && questions.length > 0 && visibleQuestions.length === 0 && (
                  <div className="rounded-xl border border-slate-100 bg-white p-8 text-center text-sm font-bold text-slate-500">
                    سوالی با این فیلترها پیدا نشد.
                  </div>
                )}

                {!questionsLoading && !questionsError && visibleQuestions.length > 0 && (
                  <div className="mx-auto grid w-full max-w-[90%] grid-cols-1 gap-4 max-md:max-w-full">
                    {visibleQuestions.map((question, index) => (
                      <QuestionCard
                        key={question.id ?? question.question_text}
                        question={question}
                        questionNumber={index + 1}
                        hasActiveSubscription={hasActiveSubscription}
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
    </AuthGuard>
  );
}
