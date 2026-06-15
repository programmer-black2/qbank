"use client";

import QuestionManagementPanel from "@/components/admin/QuestionManagementPanel";

export default function NewAuthorQuestionPage() {
  return (
    <QuestionManagementPanel
      title="پنل نویسنده - ثبت سوال"
      subtitle="از دکمه سوال جدید برای باز کردن فرم ثبت سوال استفاده کنید"
      backHref="/author"
      backLabel="بازگشت به داشبورد نویسنده"
      showStats={false}
    />
  );
}
