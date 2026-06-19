'use client';

import { useCallback, useEffect, useState } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { questionService } from '@/services/question/question.service';
import { Question, QuestionChoice, QuestionMedia } from '@/services/question/question.api';

interface Props {
  question?: Question;
  onSubmit: (data: Question) => void | Promise<void>;
  onCancel: () => void;
  uploadMedia?: (files: File[]) => Promise<QuestionMedia[]>;
}

interface CategoryStage {
  id: number;
  name_education_stage: string;
}

interface CategoryCourse {
  id: number;
  name_course: string;
}

interface CategoryYear {
  id: number;
  years_number: number;
}

interface CategoryExamType {
  id: number;
  name_exam_types: string;
}

interface FormData {
  question_text: string;
  question_type: 'mcq' | 'descriptive';
  difficulty: 'easy' | 'medium' | 'hard' | 'unknown';
  exam_type_id: number;
  choices: QuestionChoice[];
  answer?: { descriptive_answer_text: string };
  question_media: QuestionMedia[];
  answer_media: QuestionMedia[];
}

const mediaTypeOptions: Array<{ value: QuestionMedia['media_type']; label: string }> = [
  { value: 'image', label: 'تصویر' },
  { value: 'audio', label: 'صدا' },
  { value: 'video', label: 'ویدئو' },
  { value: 'pdf', label: 'PDF' },
  { value: 'document', label: 'فایل/سند' },
];

const emptyMediaItem = (): QuestionMedia => ({
  media_type: 'image',
  file_url: '',
  original_file_name: '',
  alt_text: '',
});

const inferMediaType = (file: File): QuestionMedia['media_type'] => {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('audio/')) return 'audio';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type === 'application/pdf') return 'pdf';
  return 'document';
};

const filterMediaItems = (items: QuestionMedia[] = []) =>
  items
    .filter((item) => item.file_url?.trim())
    .map((item) => ({
      media_type: item.media_type,
      file_url: item.file_url.trim(),
      original_file_name: item.original_file_name?.trim() || undefined,
      alt_text: item.alt_text?.trim() || undefined,
    }));

const getErrorMessage = (error: unknown) => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string; detail?: string } } }).response;
    return response?.data?.message || response?.data?.detail || 'خطا در ثبت سوال';
  }

  return 'خطا در ثبت سوال';
};

export default function QuestionForm({
  question,
  onSubmit,
  onCancel,
  uploadMedia = questionService.uploadQuestionMedia,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [uploadingMediaKey, setUploadingMediaKey] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [stages, setStages] = useState<CategoryStage[]>([]);
  const [courses, setCourses] = useState<CategoryCourse[]>([]);
  const [years, setYears] = useState<CategoryYear[]>([]);
  const [examTypes, setExamTypes] = useState<CategoryExamType[]>([]);
  
  const [selectedStage, setSelectedStage] = useState<number | ''>('');
  const [selectedCourse, setSelectedCourse] = useState<number | ''>('');
  const [selectedYear, setSelectedYear] = useState<number | ''>('');
  const [correctChoiceIndex, setCorrectChoiceIndex] = useState(() => {
    const initialIndex = question?.choices?.findIndex((choice) => choice.is_correct) ?? -1;
    return initialIndex >= 0 ? initialIndex : null;
  });

  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<FormData>({
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
      answer: question?.answer || { descriptive_answer_text: '' },
      question_media: question?.media_items || question?.question_media || [],
      answer_media: question?.answer_media_items || question?.answer_media || [],
    }
  });

  const { fields: choiceFields, append: appendChoice, remove: removeChoiceField } = useFieldArray({
    control,
    name: "choices"
  });

  const {
    fields: questionMediaFields,
    append: appendQuestionMedia,
    remove: removeQuestionMedia,
  } = useFieldArray({
    control,
    name: "question_media",
  });

  const {
    fields: answerMediaFields,
    append: appendAnswerMedia,
    remove: removeAnswerMedia,
  } = useFieldArray({
    control,
    name: "answer_media",
  });

  const questionType = useWatch({ control, name: 'question_type' });
  const watchedQuestionMedia = useWatch({ control, name: 'question_media' });
  const watchedAnswerMedia = useWatch({ control, name: 'answer_media' });

  const loadStages = useCallback(async () => {
    try {
      const data = await questionService.getStages();
      setStages(data);
    } catch (error) {
      console.error('Error loading stages:', error);
    }
  }, []);

  const loadCategoriesFromExamType = useCallback((examTypeId: number) => {
    // This would need a backend endpoint to get the full path for an exam type
    // For now, we'll just set the exam_type_id
    setValue('exam_type_id', examTypeId);
  }, [setValue]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadStages();
      if (question) {
        loadCategoriesFromExamType(question.exam_type_id);
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadCategoriesFromExamType, loadStages, question]);

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
        const correctChoices = data.choices
          .map((choice, index) => ({
            ...choice,
            option_number: index + 1,
            is_correct: index === correctChoiceIndex,
          }))
          .filter((choice) => choice.is_correct);

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

      const answerText = data.answer?.descriptive_answer_text?.trim() || '';
      const answerMedia = filterMediaItems(data.answer_media);

      const submitData: Question = {
        ...data,
        exam_type_id: Number(data.exam_type_id),
        choices: data.choices.map((choice, index) => ({
          ...choice,
          option_number: index + 1,
          is_correct: index === correctChoiceIndex,
        })),
        question_media: filterMediaItems(data.question_media),
        answer: answerText ? { descriptive_answer_text: answerText } : undefined,
        answer_media: answerMedia,
      };

      // Remove choices for descriptive questions
      if (data.question_type === 'descriptive') {
        delete submitData.choices;
      } else {
        // MCQ can have an optional descriptive answer key according to the backend serializer.
        if (!answerText) {
          delete submitData.answer;
          delete submitData.answer_media;
        }
      }

      await onSubmit(submitData);
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const addChoice = () => {
    appendChoice({
      option_text: '',
      option_number: choiceFields.length + 1,
      is_correct: false
    });
  };

  const removeChoice = (index: number) => {
    if (choiceFields.length > 2) {
      removeChoiceField(index);
      setCorrectChoiceIndex((currentIndex) => {
        if (currentIndex === null) return null;
        if (currentIndex === index) return null;
        if (currentIndex > index) return currentIndex - 1;
        return currentIndex;
      });

      // Reorder option numbers
      choiceFields.forEach((_, idx) => {
        if (idx > index) {
          setValue(`choices.${idx - 1}.option_number`, idx);
        }
      });
    }
  };

  const handleCorrectChoiceChange = (index: number) => {
    setCorrectChoiceIndex(index);

    choiceFields.forEach((_, choiceIndex) => {
      setValue(`choices.${choiceIndex}.is_correct`, choiceIndex === index);
    });
  };

  const handleMediaFileSelect = async (
    fieldName: 'question_media' | 'answer_media',
    index: number,
    file?: File
  ) => {
    if (!file) return;

    const mediaKey = `${fieldName}.${index}`;

    try {
      setUploadingMediaKey(mediaKey);
      setError('');

      const [uploadedMedia] = await uploadMedia([file]);

      setValue(`${fieldName}.${index}.media_type`, uploadedMedia?.media_type || inferMediaType(file));
      setValue(`${fieldName}.${index}.file_url`, uploadedMedia?.file_url || '');
      setValue(`${fieldName}.${index}.original_file_name`, uploadedMedia?.original_file_name || file.name);
      setValue(`${fieldName}.${index}.alt_text`, uploadedMedia?.alt_text || '');
    } catch (error: unknown) {
      setValue(`${fieldName}.${index}.media_type`, inferMediaType(file));
      setValue(`${fieldName}.${index}.original_file_name`, file.name);
      setError(getErrorMessage(error));
    } finally {
      setUploadingMediaKey('');
    }
  };

  const renderMediaFields = (
    title: string,
    description: string,
    fieldName: 'question_media' | 'answer_media',
    fields: Array<{ id: string }>,
    values: QuestionMedia[] = [],
    append: (item: QuestionMedia) => void,
    remove: (index: number) => void
  ) => (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-900">{title}</h3>
          <p className="mt-1 text-xs leading-6 text-gray-500">{description}</p>
        </div>

        <button
          type="button"
          onClick={() => append(emptyMediaItem())}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm font-bold text-blue-600 transition-colors hover:bg-blue-50 sm:w-auto"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          افزودن فایل
        </button>
      </div>

      {fields.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-4 py-5 text-center text-sm text-gray-500">
          هنوز فایلی اضافه نشده است.
        </div>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-sm font-bold text-gray-700">فایل {index + 1}</span>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-sm font-bold text-red-600 hover:text-red-800"
                >
                  حذف
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">انتخاب فایل</label>
                  <input
                    type="file"
                    accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                    onChange={(event) => handleMediaFileSelect(fieldName, index, event.target.files?.[0])}
                    className="w-full rounded-lg border border-gray-300 bg-white p-2 text-sm file:ml-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-bold file:text-blue-600"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    {uploadingMediaKey === `${fieldName}.${index}`
                      ? 'در حال آپلود فایل...'
                      : 'بعد از انتخاب فایل، آدرس برگشتی API در فیلد URL قرار می‌گیرد.'}
                  </p>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">نوع رسانه</label>
                  <select
                    {...register(`${fieldName}.${index}.media_type`)}
                    className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  >
                    {mediaTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-gray-600">آدرس فایل *</label>
                  <input
                    {...register(`${fieldName}.${index}.file_url`)}
                    type="text"
                    dir="ltr"
                    className="w-full rounded-lg border border-gray-300 p-3 text-left text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/file.jpg یا /media/questions/file.pdf"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">نام اصلی فایل</label>
                  <input
                    {...register(`${fieldName}.${index}.original_file_name`)}
                    type="text"
                    className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    placeholder="مثلاً anatomy-image.png"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">متن جایگزین / توضیح</label>
                  <input
                    {...register(`${fieldName}.${index}.alt_text`)}
                    type="text"
                    className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    placeholder="توضیح کوتاه برای تصویر یا فایل"
                  />
                </div>
              </div>

              {values[index]?.file_url && (
                <a
                  href={values[index].file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  مشاهده فایل
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

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

        {renderMediaFields(
          'فایل‌ها و تصاویر سوال',
          'هر سوال می‌تواند چند تصویر، صوت، ویدئو، PDF یا سند داشته باشد. این لیست دقیقاً به فیلد question_media ارسال می‌شود.',
          'question_media',
          questionMediaFields,
          watchedQuestionMedia,
          appendQuestionMedia,
          removeQuestionMedia
        )}

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

          {question?.exam_type_detail && (
            <div className="mb-3 rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900">
              <p className="font-bold">دسته‌بندی فعلی سوال:</p>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <span>مقطع: {question.exam_type_detail.stage_name}</span>
                <span>دوره: {question.exam_type_detail.course_name}</span>
                <span>سال: {question.exam_type_detail.year_number}</span>
                <span>
                  نوع آزمون: {question.exam_type_detail.name_exam_types === 'midterm' ? 'میان‌ترم' : 'پایان‌ترم'}
                </span>
              </div>
            </div>
          )}
          
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
              {choiceFields.map((field, index) => (
                <div key={field.id} className="flex items-center space-x-3 space-x-reverse">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="correct_choice"
                      checked={correctChoiceIndex === index}
                      onChange={() => handleCorrectChoiceChange(index)}
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
                  {choiceFields.length > 2 && (
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
              
              {choiceFields.length < 6 && (
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {questionType === 'descriptive' ? 'پاسخ تشریحی *' : 'پاسخ‌نامه تشریحی اختیاری'}
          </label>
          <textarea
            {...register('answer.descriptive_answer_text', {
              validate: (value) => {
                if (questionType === 'descriptive' && !value?.trim()) {
                  return 'پاسخ تشریحی الزامی است';
                }

                return true;
              },
            })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            placeholder={
              questionType === 'descriptive'
                ? 'پاسخ تشریحی سوال را وارد کنید...'
                : 'در صورت نیاز، پاسخ‌نامه تشریحی سوال تستی را وارد کنید...'
            }
          />
          {errors.answer?.descriptive_answer_text && (
            <p className="mt-1 text-sm text-red-600">
              {errors.answer.descriptive_answer_text.message}
            </p>
          )}
        </div>

        {renderMediaFields(
          'فایل‌ها و تصاویر پاسخ',
          questionType === 'descriptive'
            ? 'برای پاسخ تشریحی می‌توانید چند رسانه اضافه کنید. این لیست به فیلد answer_media ارسال می‌شود.'
            : 'برای سوال تستی هم می‌توانید فایل‌های پاسخ‌نامه تشریحی را اختیاری اضافه کنید. طبق API، فایل پاسخ فقط همراه متن پاسخ‌نامه ارسال می‌شود.',
          'answer_media',
          answerMediaFields,
          watchedAnswerMedia,
          appendAnswerMedia,
          removeAnswerMedia
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading || !!uploadingMediaKey}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading || uploadingMediaKey ? (
              <div className="flex items-center justify-center space-x-2 space-x-reverse">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{uploadingMediaKey ? 'در حال آپلود فایل...' : 'در حال ثبت...'}</span>
              </div>
            ) : (
              question ? 'بروزرسانی سوال' : 'ثبت سوال'
            )}
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            disabled={loading || !!uploadingMediaKey}
            className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            انصراف
          </button>
        </div>

      </form>
    </div>
  );
}
