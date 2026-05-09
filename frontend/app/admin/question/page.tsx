'use client';

import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import QuestionForm from "../../../components/question/QuestionForm";
import QuestionTable from "../../../components/question/QuestionTable";
import EmptyState from "../../../components/question/emptyState";
import { Dialog, DialogContent } from "@mui/material";
import { questionService } from "../../../services/question/question.service";
import { getCurrentUser, logoutUser } from "../../../services/auth/auth.api";

export default function AdminQuestionPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"questions" | "comments">("questions");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
      // بعد از احراز هویت، داده‌ها را بارگذاری کن
      await fetchQuestions();
      await fetchCourses();
    } catch (error) {
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      const data = await questionService.getQuestions();
      setQuestions(data.results || []);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchCourses = async () => {
    try {
      const data = await questionService.getCourses();
      setCourses(data || []);
    } catch (error) {
      console.log(error);
    }
  };

  const handleCreateQuestion = async (values: any) => {
    try {
      await questionService.createQuestion(values);
      await fetchQuestions();
      setIsModalOpen(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteQuestion = async (id: number) => {
    const confirmDelete = confirm("آیا از حذف این سوال مطمئن هستید؟");
    if (!confirmDelete) return;

    try {
      await questionService.deleteQuestion(id);
      await fetchQuestions();
    } catch (error) {
      console.log(error);
    }
  };

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh');
      if (refreshToken) {
        await logoutUser(refreshToken);
      }
      
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      localStorage.removeItem('user');
      
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.clear();
      router.push('/admin/login');
    }
  };

  const backToDashboard = () => {
    router.push('/admin/dashboard');
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
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4 space-x-reverse">
              <button
                onClick={backToDashboard}
                className="flex items-center space-x-2 space-x-reverse text-gray-600 hover:text-blue-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm font-medium">بازگشت به داشبورد</span>
              </button>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900">مدیریت سوالات</h1>
            </div>
            
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="text-sm text-gray-600">
                خوش آمدید، {user?.full_name || 'ادمین'}
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 space-x-reverse"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>خروج</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-2xl shadow-sm">
          <div>
            <h2 className="text-2xl font-black text-gray-800">مدیریت سوالات</h2>
            <p className="text-gray-500 text-sm mt-1">
              اضافه، حذف، ویرایش و مشاهده سوالات بانک سوال پزشکی
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center space-x-2 space-x-reverse shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>ثبت سوال جدید</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setActiveTab("questions")}
            className={`px-6 py-3 rounded-full text-sm font-bold transition-all ${
              activeTab === "questions"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-gray-500 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center space-x-2 space-x-reverse">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>مدیریت سوالات ({questions.length})</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("comments")}
            className={`px-6 py-3 rounded-full text-sm font-bold transition-all ${
              activeTab === "comments"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-gray-500 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center space-x-2 space-x-reverse">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>نظرات کاربران</span>
            </div>
          </button>
        </div>

        {/* Content */}
        {activeTab === "questions" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            {questions.length === 0 ? (
              <div className="p-8">
                <EmptyState onOpen={() => setIsModalOpen(true)} />
              </div>
            ) : (
              <div className="p-6">
                <QuestionTable
                  rows={questions}
                  onDelete={handleDeleteQuestion}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === "comments" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">بخش نظرات کاربران</h3>
              <p className="text-gray-500">
                این بخش در حال توسعه است و به زودی در دسترس خواهد بود.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Modal for Question Form */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: '16px'
          }
        }}
      >
        <DialogContent style={{ padding: 0 }}>
          <QuestionForm
            courses={courses}
            onSubmit={handleCreateQuestion}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}