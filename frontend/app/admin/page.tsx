// app/admin/page.tsx
'use client';

import { useState } from 'react';
import Header from '../../components/header/header';
import QuestionModal from '../../components/modal/QuestionModal';

interface Question {
  id: number;
  lessonTitle: string;
  questionText: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  suggestedTime: string;
  correctOption: string;
  createdAt: string;
}

export default function AdminPage() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeTab, setActiveTab] = useState<'questions' | 'comments'>('questions');

  const handleAddQuestion = (newQuestion: Question) => {
    setQuestions(prev => [newQuestion, ...prev]);
  };

  const handleDeleteQuestion = (id: number) => {
    if (confirm('آیا از حذف این سوال مطمئن هستید؟')) {
      setQuestions(prev => prev.filter(q => q.id !== id));
    }
  };

  return (
    <div >
      <section className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* هدر مدیریت */}
          <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-2xl shadow-sm">
            <div>
              <h1 className="text-2xl font-black text-gray-800">پنل مدیریت هوشمند</h1>
              <p className="text-gray-500 text-sm mt-1">مدیریت سوالات و نظرات کاربران</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all shadow-lg shadow-blue-100"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z" />
              </svg>
              ثبت سوال جدید
            </button>
          </div>

          {/* تب‌ها */}
          <div className="mb-6 flex gap-2">
            <button
              onClick={() => setActiveTab('questions')}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'questions'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-500 hover:bg-gray-100'
                }`}
            >
              مدیریت سوالات ({questions.length})
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'comments'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-500 hover:bg-gray-100'
                }`}
            >
              نظرات کاربران
            </button>
          </div>

          {/* نمایش سوالات */}
          {activeTab === 'questions' && (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {questions.length === 0 ? (
                <div className="text-center py-20">
                  <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-500 text-lg">هنوز سوالی ثبت نشده است</p>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="mt-4 text-blue-600 hover:text-blue-700 font-bold"
                  >
                    اولین سوال را ثبت کنید
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr className="text-right">
                        <th className="px-6 py-4 text-sm font-bold text-gray-600">#</th>
                        <th className="px-6 py-4 text-sm font-bold text-gray-600">عنوان درس</th>
                        <th className="px-6 py-4 text-sm font-bold text-gray-600">متن سوال</th>
                        <th className="px-6 py-4 text-sm font-bold text-gray-600">گزینه‌ها</th>
                        <th className="px-6 py-4 text-sm font-bold text-gray-600">پاسخ صحیح</th>
                        <th className="px-6 py-4 text-sm font-bold text-gray-600">زمان</th>
                        <th className="px-6 py-4 text-sm font-bold text-gray-600">عملیات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {questions.map((question, index) => (
                        <tr key={question.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                          <td className="px-6 py-4">
                            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                              {question.lessonTitle}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700 max-w-md">
                            {question.questionText}
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1 text-xs">
                              <div>۱. {question.option1}</div>
                              <div>۲. {question.option2}</div>
                              <div>۳. {question.option3}</div>
                              <div>۴. {question.option4}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {question.correctOption} 
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {question.suggestedTime} ثانیه
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleDeleteQuestion(question.id)}
                              className="text-red-400 hover:text-red-600 transition-colors"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* نظرات کاربران */}
          {activeTab === 'comments' && (
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center text-gray-500">
              <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p>بخش نظرات کاربران در حال توسعه است...</p>
            </div>
          )}
        </div>
      </section>

      {/* مودال ثبت سوال */}
      <QuestionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddQuestion={handleAddQuestion}
      />
    </div>
  );
}