"use client";

import QuestionManagementPanel from "@/components/admin/QuestionManagementPanel";
import RoleGuard from "@/components/guards/RoleGuard";

export default function NewAuthorQuestionPage() {
  return (
    <RoleGuard allowedRoles={["Writer"]} loginPath="/author/login">
      <QuestionManagementPanel
        title="پنل نویسنده - ثبت سوال"
        subtitle="از دکمه سوال جدید برای باز کردن فرم ثبت سوال استفاده کنید"
        backHref="/author"
        backLabel="بازگشت به داشبورد نویسنده"
        showStats={false}
        mode="author"
      />
    </RoleGuard>
  );
}
