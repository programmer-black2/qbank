"use client";

import QuestionManagementPanel from "@/components/admin/QuestionManagementPanel";
import RoleGuard from "@/components/guards/RoleGuard";

export default function AuthorQuestionsPage() {
  return (
    <RoleGuard allowedRoles={["Writer"]} loginPath="/author/login">
      <QuestionManagementPanel
        title="پنل نویسنده - مدیریت سوالات"
        subtitle="ثبت، ویرایش و بررسی سوالات با همان ابزار پنل ادمین"
        backHref="/author"
        backLabel="بازگشت به داشبورد نویسنده"
        showStats={false}
        mode="author"
      />
    </RoleGuard>
  );
}
