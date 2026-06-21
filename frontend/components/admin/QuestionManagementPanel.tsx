"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent } from "@mui/material";
import { useRouter } from "next/navigation";
import AdminHeader from "@/components/ui/AdminHeader";
import QuestionForm from "@/components/question/QuestionForm";
import QuestionTable from "@/components/question/QuestionTable";
import { logoutUser } from "@/services/auth/auth.api";
import { questionService } from "@/services/question/question.service";
import { Question, QuestionStatistics } from "@/services/question/question.api";

type QuestionManagementPanelProps = {
  title: string;
  subtitle: string;
  backHref: string;
  backLabel?: string;
  showStats?: boolean;
  mode?: "admin" | "author";
};

type CategoryStage = {
  id: number;
  name_education_stage: string;
};

type CategoryCourse = {
  id: number;
  name_course: string;
};

type CategoryYear = {
  id: number;
  years_number: number;
};

type CategoryExamType = {
  id: number;
  name_exam_types: string;
};

const isImageMedia = (mediaType?: string, fileUrl?: string) => {
  if (mediaType === "image") return true;
  return Boolean(fileUrl?.match(/\.(png|jpe?g|webp|gif|bmp|svg)(\?.*)?$/i));
};

const fileUrlToBase64 = async (fileUrl: string) => {
  if (!fileUrl || fileUrl.startsWith("data:")) {
    return fileUrl;
  }

  const response = await fetch(fileUrl);
  const blob = await response.blob();

  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result || fileUrl));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const withBase64Images = async (items: Question["media_items"] = []) => {
  return Promise.all(
    items.map(async (item) => {
      if (!isImageMedia(item.media_type, item.file_url)) {
        return item;
      }

      try {
        return {
          ...item,
          file_url: await fileUrlToBase64(item.file_url),
        };
      } catch {
        return item;
      }
    })
  );
};

export default function QuestionManagementPanel({
  title,
  subtitle,
  backHref,
  backLabel,
  showStats = true,
  mode = "admin",
}: QuestionManagementPanelProps) {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionStats, setQuestionStats] = useState<QuestionStatistics | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [viewingQuestion, setViewingQuestion] = useState<Question | null>(null);
  const [detailLoadingId, setDetailLoadingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [stages, setStages] = useState<CategoryStage[]>([]);
  const [courses, setCourses] = useState<CategoryCourse[]>([]);
  const [years, setYears] = useState<CategoryYear[]>([]);
  const [examTypes, setExamTypes] = useState<CategoryExamType[]>([]);
  const [filters, setFilters] = useState({
    question_type: "",
    difficulty: "",
    stage_id: "",
    course_id: "",
    year_id: "",
    exam_type_id: "",
    workflow_status: "",
  });

  const updateFilters = (updater: (previousFilters: typeof filters) => typeof filters) => {
    setCurrentPage(1);
    setFilters(updater);
  };

  const questionApi = useMemo(() => ({
    getQuestions: mode === "author" ? questionService.getAuthorQuestions : questionService.getQuestions,
    getQuestion: mode === "author" ? questionService.getAuthorQuestion : questionService.getQuestion,
    createQuestion: mode === "author" ? questionService.createAuthorQuestion : questionService.createQuestion,
    updateQuestion: mode === "author" ? questionService.updateAuthorQuestion : questionService.updateQuestion,
    deleteQuestion: mode === "author" ? questionService.deleteAuthorQuestion : questionService.deleteQuestion,
    uploadMedia: mode === "author" ? questionService.uploadAuthorQuestionMedia : questionService.uploadQuestionMedia,
  }), [mode]);

  const loadQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        page_size: 10,
        search: searchTerm || undefined,
        question_type: filters.question_type || undefined,
        difficulty: filters.difficulty || undefined,
        stage_id: filters.stage_id ? Number(filters.stage_id) : undefined,
        course_id: filters.course_id ? Number(filters.course_id) : undefined,
        year_id: filters.year_id ? Number(filters.year_id) : undefined,
        exam_type_id: filters.exam_type_id ? Number(filters.exam_type_id) : undefined,
        workflow_status: filters.workflow_status || undefined,
      };

      const [questionsResponse, statsData] = await Promise.all([
        questionApi.getQuestions(params),
        mode === "admin" && showStats ? questionService.getStatistics().catch(() => null) : Promise.resolve(null),
      ]);

      const responseResults = Array.isArray(questionsResponse)
        ? questionsResponse
        : questionsResponse.results || [];
      const responseCount = Array.isArray(questionsResponse)
        ? questionsResponse.length
        : questionsResponse.count || responseResults.length;

      setQuestions(responseResults);
      setTotalQuestions(responseCount);
      setQuestionStats(statsData);
    } catch (error) {
      console.error("Error loading questions:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters, mode, questionApi, searchTerm, showStats]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadQuestions();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadQuestions]);

  useEffect(() => {
    const loadStages = async () => {
      try {
        const data = await questionService.getStages();
        setStages(data);
      } catch (error) {
        console.error("Error loading stages:", error);
      }
    };

    loadStages();
  }, []);

  const handleCreateQuestion = async (questionData: Question) => {
    await questionApi.createQuestion(questionData);
    await loadQuestions();
    setIsModalOpen(false);
    setEditingQuestion(null);
  };

  const handleUpdateQuestion = async (questionData: Question) => {
    if (!editingQuestion?.id) return;

    await questionApi.updateQuestion(editingQuestion.id, questionData);
    await loadQuestions();
    setIsModalOpen(false);
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = async (id: number) => {
    if (!confirm("آیا از حذف این سوال اطمینان دارید؟")) {
      return;
    }

    await questionApi.deleteQuestion(id);
    await loadQuestions();
  };

  const handleApproveQuestion = async (id: number) => {
    await questionService.approveQuestion(id);
    await loadQuestions();
  };

  const handleRejectQuestion = async (id: number) => {
    const note = window.prompt("دلیل رد سوال را وارد کنید (اختیاری):") || undefined;
    await questionService.rejectQuestion(id, note);
    await loadQuestions();
  };

  const loadQuestionDetail = async (question: Question) => {
    if (!question.id) {
      return question;
    }

    setDetailLoadingId(question.id);

    try {
      return await questionApi.getQuestion(question.id);
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

  const handleCopyQuestion = async (question: Question) => {
    const questionDetail = await loadQuestionDetail(question);

    if (!questionDetail) return;

    const questionMedia = questionDetail.media_items || questionDetail.question_media || [];
    const answerMedia = questionDetail.answer_media_items || questionDetail.answer_media || [];
    const copyData = {
      question_text: questionDetail.question_text,
      question_type: questionDetail.question_type,
      difficulty: questionDetail.difficulty,
      exam_type_id: questionDetail.exam_type_id,
      exam_type_detail: questionDetail.exam_type_detail,
      choices: questionDetail.choices || [],
      answer: questionDetail.answer,
      question_media: await withBase64Images(questionMedia),
      answer_media: await withBase64Images(answerMedia),
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(copyData, null, 2));
      alert("JSON سوال در کلیپ‌بورد کپی شد.");
    } catch {
      alert("مرورگر اجازه کپی در کلیپ‌بورد را نداد.");
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingQuestion(null);
  };

  const clearFilters = () => {
    setCurrentPage(1);
    setSearchTerm("");
    setCourses([]);
    setYears([]);
    setExamTypes([]);
    setFilters({
      question_type: "",
      difficulty: "",
      stage_id: "",
      course_id: "",
      year_id: "",
      exam_type_id: "",
      workflow_status: "",
    });
  };

  const handleStageFilterChange = async (stageId: string) => {
    updateFilters((prev) => ({
      ...prev,
      stage_id: stageId,
      course_id: "",
      year_id: "",
      exam_type_id: "",
    }));
    setCourses([]);
    setYears([]);
    setExamTypes([]);

    if (!stageId) return;

    try {
      const data = await questionService.getCourses(Number(stageId));
      setCourses(data);
    } catch (error) {
      console.error("Error loading courses:", error);
    }
  };

  const handleCourseFilterChange = async (courseId: string) => {
    updateFilters((prev) => ({
      ...prev,
      course_id: courseId,
      year_id: "",
      exam_type_id: "",
    }));
    setYears([]);
    setExamTypes([]);

    if (!courseId) return;

    try {
      const data = await questionService.getYears(Number(courseId));
      setYears(data);
    } catch (error) {
      console.error("Error loading years:", error);
    }
  };

  const handleYearFilterChange = async (yearId: string) => {
    updateFilters((prev) => ({
      ...prev,
      year_id: yearId,
      exam_type_id: "",
    }));
    setExamTypes([]);

    if (!yearId) return;

    try {
      const data = await questionService.getExamTypes(Number(yearId));
      setExamTypes(data);
    } catch (error) {
      console.error("Error loading exam types:", error);
    }
  };

  const handleAuthorLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh");
      if (refreshToken) {
        await logoutUser(refreshToken);
      }
    } catch {
      // خروج سمت کاربر باید حتی در صورت منقضی بودن توکن کامل شود.
    } finally {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("user");
      router.push("/author/login");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader
        title={title}
        subtitle={subtitle}
        backHref={backHref}
        backLabel={backLabel}
        onLogout={mode === "author" ? handleAuthorLogout : undefined}
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

        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 flex-1">
              <label className="mb-1.5 block text-xs font-bold text-gray-500">جستجو</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="جستجو در متن سوال یا شناسه..."
                  value={searchTerm}
                  onChange={(event) => {
                    setCurrentPage(1);
                    setSearchTerm(event.target.value);
                  }}
                  className="block h-11 w-full rounded-lg border border-gray-300 bg-white pl-3 pr-10 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-lg shadow-blue-100 transition-all hover:bg-blue-700 sm:w-auto"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              سوال جدید
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-bold text-gray-500">فیلترهای سوال</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <select
                  value={filters.question_type}
                  onChange={(event) => updateFilters((prev) => ({ ...prev, question_type: event.target.value }))}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">همه انواع</option>
                  <option value="mcq">چند گزینه‌ای</option>
                  <option value="descriptive">تشریحی</option>
                </select>

                <select
                  value={filters.difficulty}
                  onChange={(event) => updateFilters((prev) => ({ ...prev, difficulty: event.target.value }))}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">همه سطوح</option>
                  <option value="easy">آسان</option>
                  <option value="medium">متوسط</option>
                  <option value="hard">سخت</option>
                  <option value="unknown">نامشخص</option>
                </select>

                <select
                  value={filters.workflow_status}
                  onChange={(event) => updateFilters((prev) => ({ ...prev, workflow_status: event.target.value }))}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">همه وضعیت‌ها</option>
                  <option value="pending">در انتظار تایید</option>
                  <option value="approved">تایید شده</option>
                  <option value="rejected">رد شده</option>
                </select>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-bold text-gray-500">فیلتر دسته‌بندی</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <select
                  value={filters.stage_id}
                  onChange={(event) => handleStageFilterChange(event.target.value)}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">همه مقاطع</option>
                  {stages.map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.name_education_stage}
                    </option>
                  ))}
                </select>

                <select
                  value={filters.course_id}
                  onChange={(event) => handleCourseFilterChange(event.target.value)}
                  disabled={!filters.stage_id || !courses.length}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option value="">همه دوره‌ها</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name_course}
                    </option>
                  ))}
                </select>

                <select
                  value={filters.year_id}
                  onChange={(event) => handleYearFilterChange(event.target.value)}
                  disabled={!filters.course_id || !years.length}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option value="">همه سال‌ها</option>
                  {years.map((year) => (
                    <option key={year.id} value={year.id}>
                      سال {year.years_number}
                    </option>
                  ))}
                </select>

                <select
                  value={filters.exam_type_id}
                  onChange={(event) => updateFilters((prev) => ({ ...prev, exam_type_id: event.target.value }))}
                  disabled={!filters.year_id || !examTypes.length}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option value="">همه آزمون‌ها</option>
                  {examTypes.map((examType) => (
                    <option key={examType.id} value={examType.id}>
                      {examType.name_exam_types === "midterm" ? "میان‌ترم" : "پایان‌ترم"}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="h-10 w-full rounded-lg border border-gray-300 px-4 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-800 sm:w-auto"
            >
              پاک کردن فیلترها
            </button>
          </div>
        </div>

        <div className="hidden">
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
                  onChange={(event) => {
                    setCurrentPage(1);
                    setSearchTerm(event.target.value);
                  }}
                  className="block w-full rounded-lg border border-gray-300 py-2 pl-3 pr-10 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <select
                value={filters.question_type}
                onChange={(event) => updateFilters((prev) => ({ ...prev, question_type: event.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 sm:w-auto"
              >
                <option value="">همه انواع</option>
                <option value="mcq">چند گزینه‌ای</option>
                <option value="descriptive">تشریحی</option>
              </select>

              <select
                value={filters.difficulty}
                onChange={(event) => updateFilters((prev) => ({ ...prev, difficulty: event.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 sm:w-auto"
              >
                <option value="">همه سطوح</option>
                <option value="easy">آسان</option>
                <option value="medium">متوسط</option>
                <option value="hard">سخت</option>
                <option value="unknown">نامشخص</option>
              </select>

              <select
                value={filters.stage_id}
                onChange={(event) => handleStageFilterChange(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 sm:w-auto"
              >
                <option value="">همه مقاطع</option>
                {stages.map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    {stage.name_education_stage}
                  </option>
                ))}
              </select>

              <select
                value={filters.course_id}
                onChange={(event) => handleCourseFilterChange(event.target.value)}
                disabled={!filters.stage_id || !courses.length}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 disabled:opacity-50 sm:w-auto"
              >
                <option value="">همه دوره‌ها</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name_course}
                  </option>
                ))}
              </select>

              <select
                value={filters.year_id}
                onChange={(event) => handleYearFilterChange(event.target.value)}
                disabled={!filters.course_id || !years.length}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 disabled:opacity-50 sm:w-auto"
              >
                <option value="">همه سال‌ها</option>
                {years.map((year) => (
                  <option key={year.id} value={year.id}>
                    سال {year.years_number}
                  </option>
                ))}
              </select>

              <select
                value={filters.exam_type_id}
                onChange={(event) => updateFilters((prev) => ({ ...prev, exam_type_id: event.target.value }))}
                disabled={!filters.year_id || !examTypes.length}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 disabled:opacity-50 sm:w-auto"
              >
                <option value="">همه آزمون‌ها</option>
                {examTypes.map((examType) => (
                  <option key={examType.id} value={examType.id}>
                    {examType.name_exam_types === "midterm" ? "میان‌ترم" : "پایان‌ترم"}
                  </option>
                ))}
              </select>

              <select
                value={filters.workflow_status}
                onChange={(event) => updateFilters((prev) => ({ ...prev, workflow_status: event.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 sm:w-auto"
              >
                <option value="">همه وضعیت‌ها</option>
                <option value="pending">در انتظار تایید</option>
                <option value="approved">تایید شده</option>
                <option value="rejected">رد شده</option>
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
          onCopy={handleCopyQuestion}
          onApprove={mode === "admin" ? handleApproveQuestion : undefined}
          onReject={mode === "admin" ? handleRejectQuestion : undefined}
        />

        <div className="mt-4 flex flex-col gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="font-medium text-gray-600">
            نمایش {questions.length} سوال از {totalQuestions} مورد
          </div>

          <div className="flex items-center justify-between gap-2 sm:justify-end">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1 || loading}
              className="rounded-lg border border-gray-300 px-4 py-2 font-bold text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              قبلی
            </button>
            <span className="min-w-20 text-center font-bold text-gray-800">
              صفحه {currentPage}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((page) => page + 1)}
              disabled={loading || currentPage * 10 >= totalQuestions}
              className="rounded-lg border border-gray-300 px-4 py-2 font-bold text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              بعدی
            </button>
          </div>
        </div>

        <Dialog open={isModalOpen} onClose={handleModalClose} maxWidth="lg" fullWidth>
          <DialogContent className="p-0">
            <QuestionForm
              question={editingQuestion || undefined}
              onSubmit={editingQuestion ? handleUpdateQuestion : handleCreateQuestion}
              onCancel={handleModalClose}
              uploadMedia={questionApi.uploadMedia}
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
                  <DetailItem label="وضعیت" value={viewingQuestion.workflow_status_name || viewingQuestion.workflow_status_code} />
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

                <QuestionMediaPreview
                  title="فایل‌ها و تصاویر سوال"
                  items={viewingQuestion.media_items || viewingQuestion.question_media || []}
                />

                <QuestionMediaPreview
                  title="فایل‌ها و تصاویر پاسخ"
                  items={viewingQuestion.answer_media_items || viewingQuestion.answer_media || []}
                />

                {viewingQuestion.status_history && viewingQuestion.status_history.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">تاریخچه وضعیت:</label>
                    <div className="mt-2 space-y-2">
                      {viewingQuestion.status_history.map((item) => (
                        <div key={item.id} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-sm font-bold text-gray-900">
                              {item.new_status_name || item.new_status_code}
                            </span>
                            <span className="text-xs text-gray-500">
                              {item.changed_at ? new Date(item.changed_at).toLocaleString("fa-IR") : ""}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            توسط {item.changed_by_name || "-"}
                          </p>
                          {item.note && (
                            <p className="mt-2 rounded-lg bg-white p-2 text-sm leading-6 text-gray-700">
                              {item.note}
                            </p>
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

function QuestionMediaPreview({
  title,
  items,
}: {
  title: string;
  items: NonNullable<Question["media_items"]>;
}) {
  const visibleItems = items.filter((item) => item.file_url);

  if (!visibleItems.length) {
    return null;
  }

  return (
    <div>
      <label className="text-sm font-medium text-gray-700">{title}:</label>
      <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {visibleItems.map((item, index) => (
          <div key={item.id || `${item.file_url}-${index}`} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            {isImageMedia(item.media_type, item.file_url) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.file_url}
                alt={item.alt_text || item.original_file_name || title}
                className="max-h-72 w-full rounded-lg object-contain bg-white"
              />
            ) : (
              <a
                href={item.file_url}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-bold text-blue-600 hover:text-blue-800"
              >
                {item.original_file_name || "مشاهده فایل"}
              </a>
            )}
            {(item.alt_text || item.original_file_name) && (
              <p className="mt-2 text-xs leading-5 text-gray-500">
                {item.alt_text || item.original_file_name}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
