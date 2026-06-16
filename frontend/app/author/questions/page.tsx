"use client";

import QuestionManagementPanel from "@/components/admin/QuestionManagementPanel";

export default function AuthorQuestionsPage() {
  return (
    <QuestionManagementPanel
      title="پنل نویسنده - مدیریت سوالات"
      subtitle="ثبت، ویرایش و بررسی سوالات با همان ابزار پنل ادمین"
      backHref="/author"
      backLabel="بازگشت به داشبورد نویسنده"
      showStats={false}
    />
  );
}
