'use client';

import { useState } from 'react';

interface QuestionFormData {
  lessonTitle: string;
  questionText: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  suggestedTime: string;
  correctOption: string; // اصلاح شد: correctoption -> correctOption
}

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddQuestion: (question: QuestionFormData & { id: number; createdAt: string }) => void;
}

export default function QuestionModal({ isOpen, onClose, onAddQuestion }: QuestionModalProps) {
  const [formData, setFormData] = useState<QuestionFormData>({
    lessonTitle: '',
    questionText: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    suggestedTime: '',
    correctOption: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // اعتبارسنجی ساده
    if (!formData.lessonTitle || !formData.questionText || !formData.correctOption) {
      alert('لطفاً عنوان درس، متن سوال و پاسخ صحیح را وارد کنید');
      return;
    }

    onAddQuestion({
      id: Date.now(),
      ...formData,
      createdAt: new Date().toLocaleDateString('fa-IR')
    });

    // ریست فرم
    setFormData({
      lessonTitle: '',
      questionText: '',
      option1: '',
      option2: '',
      option3: '',
      option4: '',
      suggestedTime: '',
      correctOption: ''
    });
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden">
        {/* هدر مودال */}
        <div className="p-6 pb-0">
          <h2 className="text-2xl font-black text-gray-800">ثبت سوال جدید</h2>
        </div>

        {/* فرم */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* عنوان درس */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                عنوان درس *
              </label>
              <input
                type="text"
                name="lessonTitle"
                value={formData.lessonTitle}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                placeholder="مثال: ریاضی ۲"
                required
              />
            </div>

            {/* متن سوال */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                متن سوال *
              </label>
              <textarea
                name="questionText"
                value={formData.questionText}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all resize-none"
                placeholder="متن سوال را وارد کنید"
                required
              />
            </div>

            {/* گزینه‌ها در دو ستون */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  گزینه ۱
                </label>
                <input
                  type="text"
                  name="option1"
                  value={formData.option1}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  گزینه ۲
                </label>
                <input
                  type="text"
                  name="option2"
                  value={formData.option2}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  گزینه ۳
                </label>
                <input
                  type="text"
                  name="option3"
                  value={formData.option3}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  گزینه ۴
                </label>
                <input
                  type="text"
                  name="option4"
                  value={formData.option4}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                />
              </div>
            </div>

            {/* پاسخ صحیح و زمان - در دو ستون جداگانه */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  پاسخ صحیح *
                </label>
                <select
                  name="correctOption"
                  value={formData.correctOption}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                  required
                >
                  <option value="">انتخاب کنید</option>
                  <option value="option1">گزینه ۱</option>
                  <option value="option2">گزینه ۲</option>
                  <option value="option3">گزینه ۳</option>
                  <option value="option4">گزینه ۴</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  زمان (ثانیه)
                </label>
                <input
                  type="number"
                  name="suggestedTime"
                  value={formData.suggestedTime}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                  placeholder="مثال: 30"
                  min="1"
                />
              </div>
            </div>
          </div>

          {/* دکمه‌ها */}
          <div className="flex gap-3 mt-8">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-200"
            >
              تایید نهایی
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold transition-all"
            >
              لغو
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}