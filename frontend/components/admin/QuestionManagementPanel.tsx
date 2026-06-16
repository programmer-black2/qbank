"use client";

import { useCallback, useEffect, useState } from "react";
import { Dialog, DialogContent } from "@mui/material";
import AdminHeader from "@/components/ui/AdminHeader";
import QuestionForm from "@/components/question/QuestionForm";
import QuestionTable from "@/components/question/QuestionTable";
import { questionService } from "@/services/question/question.service";
import { Question, QuestionStatistics } from "@/services/question/question.api";

type QuestionManagementPanelProps = {
  title: string;
  subtitle: string;
  backHref: string;
  backLabel?: string;
  showStats?: boolean;
};

export default function QuestionManagementPanel({
  title,
  subtitle,
  backHref,
  backLabel,
  showStats = true,
}: QuestionManagementPanelProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionStats, setQuestionStats] = useState<QuestionStatistics | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [viewingQuestion, setViewingQuestion] = useState<Question | null>(null);
  const [detailLoadingId, setDetailLoadingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    question_type: "",
    difficulty: "",
    exam_type: "",
  });

  const loadQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm || undefined,
        question_type: filters.question_type || undefined,
        difficulty: filters.difficulty || undefined,
        exam_type: filters.exam_type ? Number(filters.exam_type) : undefined,
      };

      const [questionsResponse, statsData] = await Promise.all([
        questionService.getQuestions(params),
        showStats ? questionService.getStatistics().catch(() => null) : Promise.resolve(null),
      ]);

      setQuestions(questionsResponse.results || questionsResponse);
      setQuestionStats(statsData);
    } catch (error) {
      console.error("Error loading questions:", error);
    } finally {
      setLoading(false);
    }
  }, [filters, searchTerm, showStats]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadQuestions();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadQuestions]);

  const handleCreateQuestion = async (questionData: Question) => {
    await questionService.createQuestion(questionData);
    await loadQuestions();
    setIsModalOpen(false);
    setEditingQuestion(null);
  };

  const handleUpdateQuestion = async (questionData: Question) => {
    if (!editingQuestion?.id) return;

    await questionService.updateQuestion(editingQuestion.id, questionData);
    await loadQuestions();
    setIsModalOpen(false);
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = async (id: number) => {
    if (!confirm("آیا از حذف این سوال اطمینان دارید؟")) {
      return;
    }

    await questionService.deleteQuestion(id);
    await loadQuestions();
  };

  const loadQuestionDetail = async (question: Question) => {
    if (!question.id) {
      return question;
    }

    setDetailLoadingId(question.id);

    try {
      return await questionService.getQuestion(question.id);
    } catch (error) {
      console.error("Error loading question details:", error);
      alert("خطا در دریافت جزئیات سوال");
      return null;
    } finally {
      setDetailLoadingId(null);
    }
  };

  const handleEditQuestion = async (question: Question) => {
    const questionDetail = await loadQuestionDetail(question);

    if (!questionDetail) return;

    setEditingQuestion(questionDetail);
    setIsModalOpen(true);
  };

  const handleViewQuestion = async (question: Question) => {
    const questionDetail = await loadQuestionDetail(question);

    if (!questionDetail) return;

    setViewingQuestion(questionDetail);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingQuestion(null);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilters({
      question_type: "",
      difficulty: "",
      exam_type: "",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader
        title={title}
        subtitle={subtitle}
        backHref={backHref}
        backLabel={backLabel}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {showStats && questionStats && (
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
            <StatCard label="کل سوالات" value={questionStats.total_questions} color="blue" />
            <StatCard label="چند گزینه‌ای" value={questionStats.mcq_count} color="green" />
            <StatCard label="تشریحی" value={questionStats.descriptive_count} color="purple" />
            <StatCard label="امروز" value={questionStats.today_questions} color="orange" />
          </div>
        )}

        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex-1 xl:max-w-md">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="جستجو در سوالات..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="block w-full rounded-lg border border-gray-300 py-2 pl-3 pr-10 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <select
                value={filters.question_type}
                onChange={(event) => setFilters((prev) => ({ ...prev, question_type: event.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 sm:w-auto"
              >
                <option value="">همه انواع</option>
                <option value="mcq">چند گزینه‌ای</option>
                <option value="descriptive">تشریحی</option>
              </select>

              <select
                value={filters.difficulty}
                onChange={(event) => setFilters((prev) => ({ ...prev, difficulty: event.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 sm:w-auto"
              >
                <option value="">همه سطوح</option>
                <option value="easy">آسان</option>
                <option value="medium">متوسط</option>
                <option value="hard">سخت</option>
                <option value="unknown">نامشخص</option>
              </select>

              <button
                onClick={clearFilters}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-800 sm:w-auto"
              >
                پاک کردن فیلترها
              </button>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-100 transition-all hover:bg-blue-700 sm:w-auto"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              سوال جدید
            </button>
          </div>
        </div>

        {detailLoadingId && (
          <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
            در حال دریافت جزئیات کامل سوال #{detailLoadingId}...
          </div>
        )}

        <QuestionTable
          questions={questions}
          loading={loading}
          onEdit={handleEditQuestion}
          onDelete={handleDeleteQuestion}
          onView={handleViewQuestion}
        />

        <Dialog open={isModalOpen} onClose={handleModalClose} maxWidth="lg" fullWidth>
          <DialogContent className="p-0">
            <QuestionForm
              question={editingQuestion || undefined}
              onSubmit={editingQuestion ? handleUpdateQuestion : handleCreateQuestion}
              onCancel={handleModalClose}
            />
          </DialogContent>
        </Dialog>

        {viewingQuestion && (
          <Dialog
            open={!!viewingQuestion}
            onClose={() => setViewingQuestion(null)}
            maxWidth="md"
            fullWidth
          >
            <DialogContent>
              <div className="space-y-5 p-6">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    جزئیات سوال #{viewingQuestion.id}
                  </h2>
                  <button
                    onClick={() => setViewingQuestion(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">متن سوال:</label>
                  <p className="mt-1 whitespace-pre-wrap rounded-xl bg-gray-50 p-3 text-gray-900">
                    {viewingQuestion.question_text}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <DetailItem label="نوع سوال" value={viewingQuestion.question_type_display || viewingQuestion.question_type} />
                  <DetailItem label="سطح دشواری" value={viewingQuestion.difficulty_display || viewingQuestion.difficulty} />
                  <DetailItem label="شناسه نوع آزمون" value={viewingQuestion.exam_type_id} />
                  <DetailItem
                    label="ایجاد"
                    value={
                      viewingQuestion.created_at
                        ? new Date(viewingQuestion.created_at).toLocaleString("fa-IR")
                        : "-"
                    }
                  />
                </div>

                {viewingQuestion.choices && viewingQuestion.choices.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">گزینه‌ها:</label>
                    <div className="mt-2 space-y-2">
                      {viewingQuestion.choices.map((choice) => (
                        <div
                          key={choice.id || choice.option_number}
                          className={`rounded-lg border p-3 ${
                            choice.is_correct
                              ? "border-green-200 bg-green-50"
                              : "border-gray-200 bg-gray-50"
                          }`}
                        >
                          <span className="font-bold text-gray-800">
                            گزینه {choice.option_number}:
                          </span>{" "}
                          {choice.option_text}
                          {choice.is_correct && (
                            <span className="mr-2 rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                              پاسخ صحیح
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "blue" | "green" | "purple" | "orange";
}) {
  const colors = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600",
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${colors[color]}`}>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6M7 4h10a2 2 0 012 2v14l-4-2-4 2-4-2-4 2V6a2 2 0 012-2z" />
          </svg>
        </div>
        <div className="mr-3">
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value?: string | number }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}:</label>
      <p className="mt-1 text-gray-900">{value || "-"}</p>
    </div>
  );
}
