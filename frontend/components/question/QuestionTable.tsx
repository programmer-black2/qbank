'use client';

import { Question } from '@/services/question/question.api';

interface Props {
  questions: Question[];
  loading?: boolean;
  onEdit?: (question: Question) => void;
  onDelete?: (id: number) => void;
  onView: (question: Question) => void;
  onCopy?: (question: Question) => void;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
}

export default function QuestionTable({
  questions,
  loading,
  onEdit,
  onDelete,
  onView,
  onCopy,
  onApprove,
  onReject,
}: Props) {
  const getDisplayQuestionId = (id?: number) => (
    typeof id === 'number' ? id - 1 : id
  );

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'mcq': return 'چند گزینه‌ای';
      case 'descriptive': return 'تشریحی';
      default: return type;
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'آسان';
      case 'medium': return 'متوسط';
      case 'hard': return 'سخت';
      case 'unknown': return 'نامشخص';
      default: return difficulty;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      case 'unknown': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getWorkflowStatusLabel = (question: Question) => {
    if (question.workflow_status_name) return question.workflow_status_name;

    switch (question.workflow_status_code) {
      case 'pending': return 'در انتظار تایید';
      case 'approved': return 'تایید شده';
      case 'rejected': return 'رد شده';
      default: return 'بدون وضعیت';
    }
  };

  const getWorkflowStatusColor = (status?: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const renderActions = (question: Question) => (
    <div className="flex items-center gap-3">
      {onApprove && question.workflow_status_code !== 'approved' && (
        <button
          onClick={() => onApprove(question.id!)}
          className="text-emerald-600 hover:text-emerald-800 transition-colors"
          title="ØªØ§ÛŒÛŒØ¯ Ø¨Ø±Ø§ÛŒ Ø§Ù†ØªØ´Ø§Ø±"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </button>
      )}

      {onReject && question.workflow_status_code !== 'rejected' && (
        <button
          onClick={() => onReject(question.id!)}
          className="text-amber-600 hover:text-amber-800 transition-colors"
          title="Ø±Ø¯ Ø³ÙˆØ§Ù„"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      <button
        onClick={() => onView(question)}
        className="text-blue-600 hover:text-blue-800 transition-colors"
        title="Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ø¬Ø²Ø¦ÛŒØ§Øª"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      </button>

      {onCopy && (
        <button
          onClick={() => onCopy(question)}
          className="text-indigo-600 hover:text-indigo-800 transition-colors"
          title="Ú©Ù¾ÛŒ JSON Ø³ÙˆØ§Ù„"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      )}

      {onEdit && (
        <button
          onClick={() => onEdit(question)}
          className="text-green-600 hover:text-green-800 transition-colors"
          title="ÙˆÛŒØ±Ø§ÛŒØ´"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      )}

      {onDelete && (
        <button
          onClick={() => onDelete(question.id!)}
          className="text-red-600 hover:text-red-800 transition-colors"
          title="Ø­Ø°Ù"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">هیچ سوالی یافت نشد</h3>
        <p className="text-gray-500">فیلترهای جستجو را تغییر دهید</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">
          لیست سوالات 
        </h3>
      </div>

      <div className="space-y-3 p-4 md:hidden">
        {questions.map((question) => (
          <article key={question.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-500">{getDisplayQuestionId(question.id)}</p>
                <p className="mt-1 line-clamp-3 text-sm font-bold leading-6 text-gray-900">
                  {question.question_text}
                </p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
                getWorkflowStatusColor(question.workflow_status_code)
              }`}>
                {getWorkflowStatusLabel(question)}
              </span>
            </div>

            <div className="mb-3 flex flex-wrap gap-2">
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                question.question_type === 'mcq'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-purple-100 text-purple-800'
              }`}>
                {getQuestionTypeLabel(question.question_type)}
              </span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${getDifficultyColor(question.difficulty)}`}>
                {getDifficultyLabel(question.difficulty)}
              </span>
            </div>

            <div className="mb-4 space-y-1 text-xs font-medium text-gray-500">
              {question.stage_name && <p>{question.stage_name}</p>}
              {question.course_name && <p>{question.course_name}</p>}
              {question.year_number && <p>سال {question.year_number}</p>}
              {question.exam_type_name && (
                <p className="text-blue-600">
                  {question.exam_type_name === 'midterm' ? 'میان‌ترم' : 'پایان‌ترم'}
                </p>
              )}
              <p>{formatDate(question.created_at)}</p>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-3">
              <span className="text-xs font-bold text-gray-400">عملیات</span>
              {renderActions(question)}
            </div>
          </article>
        ))}
      </div>

      {/* Table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                شناسه
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                متن سوال
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                نوع
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                سطح دشواری
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                دسته‌بندی
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                ایجاد شده
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                وضعیت انتشار
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                عملیات
              </th>
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {questions.map((question) => (
              <tr key={question.id} className="hover:bg-gray-50 transition-colors">
                {/* ID */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {getDisplayQuestionId(question.id)}
                </td>

                {/* Question Text */}
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="max-w-xs">
                    <p className="line-clamp-2" title={question.question_text}>
                      {truncateText(question.question_text)}
                    </p>
                  </div>
                </td>

                {/* Question Type */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    question.question_type === 'mcq' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {getQuestionTypeLabel(question.question_type)}
                  </span>
                </td>

                {/* Difficulty */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    getDifficultyColor(question.difficulty)
                  }`}>
                    {getDifficultyLabel(question.difficulty)}
                  </span>
                </td>

                {/* Category */}
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="flex flex-col space-y-1">
                    {question.stage_name && (
                      <span className="text-xs text-gray-600">
                        📚 {question.stage_name}
                      </span>
                    )}
                    {question.course_name && (
                      <span className="text-xs text-gray-600">
                        📖 {question.course_name}
                      </span>
                    )}
                    {question.year_number && (
                      <span className="text-xs text-gray-600">
                        📅 سال {question.year_number}
                      </span>
                    )}
                    {question.exam_type_name && (
                      <span className="text-xs font-medium text-blue-600">
                        📋 {question.exam_type_name === 'midterm' ? 'میان‌ترم' : 'پایان‌ترم'}
                      </span>
                    )}
                  </div>
                </td>

                {/* Created At */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex flex-col">
                    <span>{formatDate(question.created_at)}</span>
                    {question.created_by_name && (
                      <span className="text-xs text-gray-400">
                        توسط {question.created_by_name}
                      </span>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    getWorkflowStatusColor(question.workflow_status_code)
                  }`}>
                    {getWorkflowStatusLabel(question)}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    {onApprove && question.workflow_status_code !== 'approved' && (
                      <button
                        onClick={() => onApprove(question.id!)}
                        className="text-emerald-600 hover:text-emerald-800 transition-colors"
                        title="تایید برای انتشار"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    )}

                    {onReject && question.workflow_status_code !== 'rejected' && (
                      <button
                        onClick={() => onReject(question.id!)}
                        className="text-amber-600 hover:text-amber-800 transition-colors"
                        title="رد سوال"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}

                    {/* View */}
                    <button
                      onClick={() => onView(question)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                      title="مشاهده جزئیات"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>

                    {onCopy && (
                      <button
                        onClick={() => onCopy(question)}
                        className="text-indigo-600 hover:text-indigo-800 transition-colors"
                        title="کپی سوال"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    )}

                    {onEdit && (
                      <button
                        onClick={() => onEdit(question)}
                        className="text-green-600 hover:text-green-800 transition-colors"
                        title="ویرایش"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    )}

                    {onDelete && (
                      <button
                        onClick={() => onDelete(question.id!)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="حذف"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Keep backward compatibility
interface OldProps {
  rows: Question[];
  onDelete: (id: number) => void;
}

export function QuestionTableOld({ rows, onDelete }: OldProps) {
  const handleEdit = () => {
    console.log('Edit not implemented in old version');
  };

  const handleView = () => {
    console.log('View not implemented in old version');
  };

  return (
    <QuestionTable 
      questions={rows} 
      onEdit={handleEdit} 
      onDelete={onDelete} 
      onView={handleView} 
    />
  );
}
