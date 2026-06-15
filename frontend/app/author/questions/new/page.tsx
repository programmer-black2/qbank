"use client";

import { useRouter } from "next/navigation";
import AuthorLayout from "@/components/layout/AuthorLayout";
import QuestionForm from "@/components/question/QuestionForm";
import { createQuestion, Question } from "@/services/question/question.api";

export default function NewAuthorQuestionPage() {
  const router = useRouter();

  const handleSubmit = async (data: Question) => {
    await createQuestion(data);
    router.push("/author/questions");
  };

  return (
    <AuthorLayout title="ثبت سوال جدید">
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <QuestionForm
          onSubmit={handleSubmit}
          onCancel={() => router.push("/author/questions")}
        />
      </div>
    </AuthorLayout>
  );
}
