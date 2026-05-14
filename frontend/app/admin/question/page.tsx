'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/services/auth/auth.api';
import AdminHeader from '@/components/ui/AdminHeader';
import QuestionForm from "../../../components/question/QuestionForm";
import QuestionTable from "../../../components/question/QuestionTable";
import { Dialog, DialogContent } from "@mui/material";
import { questionService } from "../../../services/question/question.service";
import { Question, QuestionStatistics } from "../../../services/question/question.api";

export default function AdminQuestionPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionStats, setQuestionStats] = useState<QuestionStatistics | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [viewingQuestion, setViewingQuestion] = useState<Question | null>(null);
  const [detailLoadingId, setDetailLoadingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    question_type: '',
    difficulty: '',
    exam_type: ''
  });

  const checkAuth = useCallback(async () => {
    try {
      await getCurrentUser();
      setIsAuthenticated(true);
    } catch {
      router.push('/admin/login');
    }
  }, [router]);

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
        questionService.getStatistics().catch(() => null), // Optional stats
      ]);

      setQuestions(questionsResponse.results || questionsResponse);
      setQuestionStats(statsData);
    } catch (error) {
      console.error("Error loading questions:", error);
    } finally {
      setLoading(false);
    }
  }, [filters, searchTerm]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      checkAuth();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      const timeoutId = window.setTimeout(() => {
        loadQuestions();
      }, 0);

      return () => window.clearTimeout(timeoutId);
    }
  }, [isAuthenticated, loadQuestions]);

  const handleCreateQuestion = async (questionData: Question) => {
    try {
      await questionService.createQuestion(questionData);
      await loadQuestions();
      setIsModalOpen(false);
      setEditingQuestion(null);
    } catch (error) {
      console.error('Error creating question:', error);
      throw error;
    }
  };

  const handleUpdateQuestion = async (questionData: Question) => {
    try {
      if (!editingQuestion?.id) return;
      await questionService.updateQuestion(editingQuestion.id, questionData);
      await loadQuestions();
      setIsModalOpen(false);
      setEditingQuestion(null);
    } catch (error) {
      console.error('Error updating question:', error);
      throw error;
    }
  };

  const handleDeleteQuestion = async (id: number) => {
    if (confirm('آیا از حذف این سوال اطمینان دارید؟')) {
      try {
        await questionService.deleteQuestion(id);
        await loadQuestions();
      } catch (error) {
        console.error('Error deleting question:', error);
        alert('خطا در حذف سوال');
      }
    }
  };

  const loadQuestionDetail = async (question: Question) => {
    if (!question.id) {
      return question;
    }

    setDetailLoadingId(question.id);

    try {
      return await questionService.getQuestion(question.id);
    } catch (error) {
      console.error('Error loading question details:', error);
      alert('خطا در دریافت جزئیات کامل سوال');
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
    setSearchTerm('');
    setFilters({
      question_type: '',
      difficulty: '',
      exam_type: ''
    });
  };

  const getExamTypeLabel = (examType?: string) => {
    if (examType === 'midterm') return 'میان‌ترم';
    if (examType === 'final') return 'پایان‌ترم';
    return examType || '-';
  };

  const getMediaTypeLabel = (mediaType: string) => {
    switch (mediaType) {
      case 'image':
        return 'تصویر';
      case 'audio':
        return 'صدا';
      case 'video':
        return 'ویدئو';
      case 'pdf':
        return 'PDF';
      case 'document':
        return 'فایل/سند';
      default:
        return mediaType;
    }
  };

  const renderMediaList = (title: string, items = [] as NonNullable<Question['media_items']>) => (
    <div>
      <label className="text-sm font-medium text-gray-700">{title}:</label>
      {items.length > 0 ? (
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {items.map((item) => (
            <a
              key={item.id || item.file_url}
              href={item.file_url}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm transition-colors hover:border-blue-200 hover:bg-blue-50"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-bold text-gray-900">
                  {item.original_file_name || 'مشاهده فایل'}
                </span>
                <span className="rounded-full bg-white px-2 py-1 text-xs text-gray-600">
                  {getMediaTypeLabel(item.media_type)}
                </span>
              </div>
              {item.alt_text && (
                <p className="mt-2 text-xs text-gray-500">{item.alt_text}</p>
              )}
            </a>
          ))}
        </div>
      ) : (
        <p className="mt-1 text-sm text-gray-400">فایلی ثبت نشده است.</p>
      )}
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader
        title="مدیریت سوالات"
        subtitle="جستجو، فیلتر، ثبت و بررسی سوالات بانک سوال"
        backHref="/admin/dashboard"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Stats Cards */}
        {questionStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="mr-3">
                  <p className="text-sm font-medium text-gray-500">کل سوالات</p>
                  <p className="text-2xl font-semibold text-gray-900">{questionStats.total_questions}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M9 5H7a2 2 0 00-2 2v1a2 2 0 002 2h2m0 0V9a2 2 0 012-2h2a2 2 0 012 2v1a2 2 0 01-2 2H9V8z" />
                    </svg>
                  </div>
                </div>
                <div className="mr-3">
                  <p className="text-sm font-medium text-gray-500">چند گزینه‌ای</p>
                  <p className="text-2xl font-semibold text-gray-900">{questionStats.mcq_count}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                </div>
                <div className="mr-3">
                  <p className="text-sm font-medium text-gray-500">تشریحی</p>
                  <p className="text-2xl font-semibold text-gray-900">{questionStats.descriptive_count}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="mr-3">
                  <p className="text-sm font-medium text-gray-500">امروز</p>
                  <p className="text-2xl font-semibold text-gray-900">{questionStats.today_questions}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            
            {/* Search */}
            <div className="flex-1 xl:max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="جستجو در سوالات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <select
                value={filters.question_type}
                onChange={(e) => setFilters(prev => ({ ...prev, question_type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:w-auto"
              >
                <option value="">همه انواع</option>
                <option value="mcq">چند گزینه‌ای</option>
                <option value="descriptive">تشریحی</option>
              </select>

              <select
                value={filters.difficulty}
                onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:w-auto"
              >
                <option value="">همه سطوح</option>
                <option value="easy">آسان</option>
                <option value="medium">متوسط</option>
                <option value="hard">سخت</option>
                <option value="unknown">نامشخص</option>
              </select>

              <button
                onClick={clearFilters}
                className="w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 sm:w-auto"
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

        {/* Questions Table */}
        <QuestionTable
          questions={questions}
          loading={loading}
          onEdit={handleEditQuestion}
          onDelete={handleDeleteQuestion}
          onView={handleViewQuestion}
        />

        {/* Create/Edit Question Modal */}
        <Dialog
          open={isModalOpen}
          onClose={handleModalClose}
          maxWidth="lg"
          fullWidth
        >
          <DialogContent className="p-0">
            <QuestionForm
              question={editingQuestion || undefined}
              onSubmit={editingQuestion ? handleUpdateQuestion : handleCreateQuestion}
              onCancel={handleModalClose}
            />
          </DialogContent>
        </Dialog>

        {/* View Question Modal */}
        {viewingQuestion && (
          <Dialog
            open={!!viewingQuestion}
            onClose={() => setViewingQuestion(null)}
            maxWidth="md"
            fullWidth
          >
            <DialogContent>
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    جزئیات سوال #{viewingQuestion.id}
                  </h2>
                  <button
                    onClick={() => setViewingQuestion(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="text-sm font-medium text-gray-700">متن سوال:</label>
                    <p className="mt-1 rounded-xl bg-gray-50 p-3 text-gray-900 whitespace-pre-wrap">
                      {viewingQuestion.question_text}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-gray-700">نوع سوال:</label>
                      <p className="mt-1 text-gray-900">
                        {viewingQuestion.question_type === 'mcq' ? 'چند گزینه‌ای' : 'تشریحی'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">سطح دشواری:</label>
                      <p className="mt-1 text-gray-900">
                        {viewingQuestion.difficulty === 'easy' ? 'آسان' : 
                         viewingQuestion.difficulty === 'medium' ? 'متوسط' :
                         viewingQuestion.difficulty === 'hard' ? 'سخت' : 'نامشخص'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">شناسه نوع آزمون:</label>
                      <p className="mt-1 text-gray-900">{viewingQuestion.exam_type_id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">ایجاد:</label>
                      <p className="mt-1 text-gray-900">
                        {viewingQuestion.created_at
                          ? new Date(viewingQuestion.created_at).toLocaleString('fa-IR')
                          : '-'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">آخرین ویرایش:</label>
                      <p className="mt-1 text-gray-900">
                        {viewingQuestion.updated_at
                          ? new Date(viewingQuestion.updated_at).toLocaleString('fa-IR')
                          : '-'}
                      </p>
                    </div>
                  </div>

                  {viewingQuestion.exam_type_detail && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">دسته‌بندی:</label>
                      <div className="mt-2 grid grid-cols-1 gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-800 sm:grid-cols-2">
                        <span>مقطع: {viewingQuestion.exam_type_detail.stage_name}</span>
                        <span>دوره: {viewingQuestion.exam_type_detail.course_name}</span>
                        <span>سال: {viewingQuestion.exam_type_detail.year_number}</span>
                        <span>نوع آزمون: {getExamTypeLabel(viewingQuestion.exam_type_detail.name_exam_types)}</span>
                      </div>
                    </div>
                  )}

                  {renderMediaList('فایل‌ها و تصاویر سوال', viewingQuestion.media_items || [])}

                  {viewingQuestion.choices && viewingQuestion.choices.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">گزینه‌ها:</label>
                      <div className="mt-2 space-y-2">
                        {viewingQuestion.choices.map((choice) => (
                          <div key={choice.id} className={`p-3 rounded-lg border ${
                            choice.is_correct ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                          }`}>
                            <div className="flex items-center space-x-3 space-x-reverse">
                              <span className="text-sm font-medium text-gray-700">
                                گزینه {choice.option_number}:
                              </span>
                              <span className="text-gray-900">{choice.option_text}</span>
                              {choice.is_correct && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                  پاسخ صحیح
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      پاسخ‌نامه تشریحی:
                    </label>
                    {viewingQuestion.answer ? (
                      <div className="mt-1 rounded-lg border border-blue-200 bg-blue-50 p-3">
                        <p className="text-gray-900 whitespace-pre-wrap">
                          {viewingQuestion.answer.descriptive_answer_text}
                        </p>
                      </div>
                    ) : (
                      <p className="mt-1 text-sm text-gray-400">پاسخ‌نامه تشریحی ثبت نشده است.</p>
                    )}
                  </div>

                  {renderMediaList('فایل‌ها و تصاویر پاسخ', viewingQuestion.answer_media_items || [])}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}