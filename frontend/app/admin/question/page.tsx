'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/services/auth/auth.api';
import QuestionForm from "../../../components/question/QuestionForm";
import QuestionTable from "../../../components/question/QuestionTable";
import EmptyState from "../../../components/question/emptyState";
import { Dialog, DialogContent } from "@mui/material";
import { questionService } from "../../../services/question/question.service";
import { Question, QuestionListResponse } from "../../../services/question/question.api";

export default function AdminQuestionPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionStats, setQuestionStats] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [viewingQuestion, setViewingQuestion] = useState<Question | null>(null);
  const [activeTab, setActiveTab] = useState<"questions" | "comments">("questions");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    question_type: '',
    difficulty: '',
    exam_type: ''
  });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      loadQuestions();
    }
  }, [searchTerm, filters, user]);

  const checkAuth = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (error) {
      router.push('/admin/login');
    }
  };

  const loadQuestions = async () => {
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
  };

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

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setIsModalOpen(true);
  };

  const handleViewQuestion = (question: Question) => {
    setViewingQuestion(question);
  };

  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    router.push('/admin/login');
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

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4 space-x-reverse">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-2 space-x-reverse"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>بازگشت به داشبورد</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">مدیریت سوالات</h1>
            </div>

            <div className="flex items-center space-x-4 space-x-reverse">
              <span className="text-sm text-gray-600">
                خوش آمدید، {user.full_name || user.phone}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-800"
              >
                خروج
              </button>
            </div>
          </div>
        </div>
      </div>

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
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            
            {/* Search */}
            <div className="flex-1 lg:max-w-md">
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
            <div className="flex flex-wrap gap-3">
              <select
                value={filters.question_type}
                onChange={(e) => setFilters(prev => ({ ...prev, question_type: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">همه انواع</option>
                <option value="mcq">چند گزینه‌ای</option>
                <option value="descriptive">تشریحی</option>
              </select>

              <select
                value={filters.difficulty}
                onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">همه سطوح</option>
                <option value="easy">آسان</option>
                <option value="medium">متوسط</option>
                <option value="hard">سخت</option>
                <option value="unknown">نامشخص</option>
              </select>

              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                پاک کردن فیلترها
              </button>
            </div>

            {/* Add Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2 space-x-reverse"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>سوال جدید</span>
            </button>
          </div>
        </div>

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

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">متن سوال:</label>
                    <p className="mt-1 text-gray-900 whitespace-pre-wrap">{viewingQuestion.question_text}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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
                  </div>

                  {viewingQuestion.choices && viewingQuestion.choices.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">گزینه‌ها:</label>
                      <div className="mt-2 space-y-2">
                        {viewingQuestion.choices.map((choice, index) => (
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

                  {viewingQuestion.answer && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">پاسخ تشریحی:</label>
                      <div className="mt-1 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-gray-900 whitespace-pre-wrap">
                          {viewingQuestion.answer.descriptive_answer_text}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}