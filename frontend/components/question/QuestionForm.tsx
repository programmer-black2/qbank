'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { questionService } from '@/services/question/question.service';
import { Question, QuestionChoice } from '@/services/question/question.api';

interface Props {
  question?: Question;
  onSubmit: (data: Question) => void;
  onCancel: () => void;
}

interface FormData {
  question_text: string;
  question_type: 'mcq' | 'descriptive';
  difficulty: 'easy' | 'medium' | 'hard' | 'unknown';
  exam_type_id: number;
  choices: QuestionChoice[];
  answer?: { descriptive_answer_text: string };
}

export default function QuestionForm({ question, onSubmit, onCancel }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [stages, setStages] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [years, setYears] = useState<any[]>([]);
  const [examTypes, setExamTypes] = useState<any[]>([]);
  
  const [selectedStage, setSelectedStage] = useState<number | ''>('');
  const [selectedCourse, setSelectedCourse] = useState<number | ''>('');
  const [selectedYear, setSelectedYear] = useState<number | ''>('');

  const { register, handleSubmit, watch, control, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      question_text: question?.question_text || '',
      question_type: question?.question_type || 'mcq',
      difficulty: question?.difficulty || 'medium',
      exam_type_id: question?.exam_type_id || 0,
      choices: question?.choices || [
        { option_text: '', option_number: 1, is_correct: false },
        { option_text: '', option_number: 2, is_correct: false },
        { option_text: '', option_number: 3, is_correct: false },
        { option_text: '', option_number: 4, is_correct: false },
      ],
      answer: question?.answer || { descriptive_answer_text: '' }
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "choices"
  });

  const questionType = watch('question_type');

  useEffect(() => {
    loadStages();
    if (question) {
      // If editing, load categories based on question's exam_type
      loadCategoriesFromExamType(question.exam_type_id);
    }
  }, [question]);

  const loadStages = async () => {
    try {
      const data = await questionService.getStages();
      setStages(data);
    } catch (error) {
      console.error('Error loading stages:', error);
    }
  };

  const loadCategoriesFromExamType = async (examTypeId: number) => {
    // This would need a backend endpoint to get the full path for an exam type
    // For now, we'll just set the exam_type_id
    setValue('exam_type_id', examTypeId);
  };

  const handleStageChange = async (stageId: number) => {
    setSelectedStage(stageId);
    setSelectedCourse('');
    setSelectedYear('');
    setCourses([]);
    setYears([]);
    setExamTypes([]);
    setValue('exam_type_id', 0);

    if (stageId) {
      try {
        const data = await questionService.getCourses(stageId);
        setCourses(data);
      } catch (error) {
        console.error('Error loading courses:', error);
      }
    }
  };

  const handleCourseChange = async (courseId: number) => {
    setSelectedCourse(courseId);
    setSelectedYear('');
    setYears([]);
    setExamTypes([]);
    setValue('exam_type_id', 0);

    if (courseId) {
      try {
        const data = await questionService.getYears(courseId);
        setYears(data);
      } catch (error) {
        console.error('Error loading years:', error);
      }
    }
  };

  const handleYearChange = async (yearId: number) => {
    setSelectedYear(yearId);
    setExamTypes([]);
    setValue('exam_type_id', 0);

    if (yearId) {
      try {
        const data = await questionService.getExamTypes(yearId);
        setExamTypes(data);
      } catch (error) {
        console.error('Error loading exam types:', error);
      }
    }
  };

  const handleFormSubmit = async (data: FormData) => {
    setLoading(true);
    setError('');

    try {
      // Validate based on question type
      if (data.question_type === 'mcq') {
        const correctChoices = data.choices.filter(choice => choice.is_correct);
        if (correctChoices.length !== 1) {
          setError('دقیقاً یک گزینه باید صحیح باشد');
          return;
        }
      } else if (data.question_type === 'descriptive') {
        if (!data.answer?.descriptive_answer_text?.trim()) {
          setError('پاسخ تشریحی الزامی است');
          return;
        }
      }

      if (!data.exam_type_id) {
        setError('انتخاب دسته‌بندی الزامی است');
        return;
      }

      const submitData: Question = {
        ...data,
        exam_type_id: Number(data.exam_type_id)
      };

      // Remove choices for descriptive questions
      if (data.question_type === 'descriptive') {
        delete submitData.choices;
      } else {
        // Remove answer for MCQ questions
        delete submitData.answer;
      }

      await onSubmit(submitData);
    } catch (error: any) {
      setError(error.response?.data?.message || 'خطا در ثبت سوال');
    } finally {
      setLoading(false);
    }
  };

  const addChoice = () => {
    append({
      option_text: '',
      option_number: fields.length + 1,
      is_correct: false
    });
  };

  const removeChoice = (index: number) => {
    if (fields.length > 2) {
      remove(index);
      // Reorder option numbers
      fields.forEach((_, idx) => {
        if (idx > index) {
          setValue(`choices.${idx - 1}.option_number`, idx);
        }
      });
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {question ? 'ویرایش سوال' : 'سوال جدید'}
        </h2>
        <p className="text-gray-600 text-sm">
          لطفاً اطلاعات سوال را وارد کنید
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        
        {/* Question Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            متن سوال *
          </label>
          <textarea
            {...register('question_text', { required: 'متن سوال الزامی است' })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            placeholder="متن سوال خود را وارد کنید..."
          />
          {errors.question_text && (
            <p className="mt-1 text-sm text-red-600">{errors.question_text.message}</p>
          )}
        </div>

        {/* Question Type and Difficulty */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نوع سوال *
            </label>
            <select
              {...register('question_type', { required: 'نوع سوال الزامی است' })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="mcq">چند گزینه‌ای</option>
              <option value="descriptive">تشریحی</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              سطح دشواری
            </label>
            <select
              {...register('difficulty')}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="easy">آسان</option>
              <option value="medium">متوسط</option>
              <option value="hard">سخت</option>
              <option value="unknown">نامشخص</option>
            </select>
          </div>
        </div>

        {/* Category Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            دسته‌بندی *
          </label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Stage */}
            <select
              value={selectedStage}
              onChange={(e) => handleStageChange(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">انتخاب مقطع</option>
              {stages.map(stage => (
                <option key={stage.id} value={stage.id}>
                  {stage.name_education_stage}
                </option>
              ))}
            </select>

            {/* Course */}
            <select
              value={selectedCourse}
              onChange={(e) => handleCourseChange(Number(e.target.value))}
              disabled={!courses.length}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            >
              <option value="">انتخاب دوره</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.name_course}
                </option>
              ))}
            </select>

            {/* Year */}
            <select
              value={selectedYear}
              onChange={(e) => handleYearChange(Number(e.target.value))}
              disabled={!years.length}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            >
              <option value="">انتخاب سال</option>
              {years.map(year => (
                <option key={year.id} value={year.id}>
                  سال {year.years_number}
                </option>
              ))}
            </select>

            {/* Exam Type */}
            <select
              {...register('exam_type_id', { required: 'انتخاب نوع آزمون الزامی است' })}
              disabled={!examTypes.length}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            >
              <option value="">انتخاب آزمون</option>
              {examTypes.map(examType => (
                <option key={examType.id} value={examType.id}>
                  {examType.name_exam_types === 'midterm' ? 'میان‌ترم' : 'پایان‌ترم'}
                </option>
              ))}
            </select>
          </div>
          {errors.exam_type_id && (
            <p className="mt-1 text-sm text-red-600">{errors.exam_type_id.message}</p>
          )}
        </div>

        {/* Choices for MCQ */}
        {questionType === 'mcq' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              گزینه‌ها *
            </label>
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center space-x-3 space-x-reverse">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      {...register(`choices.${index}.is_correct`)}
                      name="correct_choice"
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      {...register(`choices.${index}.option_text`, { required: 'متن گزینه الزامی است' })}
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={`گزینه ${index + 1}`}
                    />
                    <input
                      {...register(`choices.${index}.option_number`)}
                      type="hidden"
                      value={index + 1}
                    />
                  </div>
                  {fields.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeChoice(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              
              {fields.length < 6 && (
                <button
                  type="button"
                  onClick={addChoice}
                  className="flex items-center space-x-2 space-x-reverse text-blue-600 hover:text-blue-800"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>افزودن گزینه</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Answer for Descriptive */}
        {questionType === 'descriptive' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              پاسخ تشریحی *
            </label>
            <textarea
              {...register('answer.descriptive_answer_text', { required: 'پاسخ تشریحی الزامی است' })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="پاسخ تشریحی سوال را وارد کنید..."
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2 space-x-reverse">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>در حال ثبت...</span>
              </div>
            ) : (
              question ? 'بروزرسانی سوال' : 'ثبت سوال'
            )}
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            انصراف
          </button>
        </div>

      </form>
    </div>
  );
}