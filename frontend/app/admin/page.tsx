"use client";

import { useEffect, useState } from "react";

import AdminHeader from "@/components/ui/AdminHeader";
import QuestionForm from "../../components/question/QuestionForm";

import QuestionTable from "../../components/question/QuestionTable";

import EmptyState from "../../components/question/emptyState";

import {
  Dialog,
  DialogContent,
} from "@mui/material";

import { questionService } from "../../services/question/question.service";

export default function AdminPage() {
  const [questions, setQuestions] =
    useState<any[]>([]);

  const [courses, setCourses] =
    useState<any[]>([]);

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [activeTab, setActiveTab] =
    useState<
      "questions" | "comments"
    >("questions");

  /* fetch اولیه */

  useEffect(() => {
    fetchQuestions();

    fetchCourses();
  }, []);

  /* fetch سوالات */

  const fetchQuestions = async () => {
    try {
      const data =
        await questionService.getQuestions();

      setQuestions(data.results || []);
    } catch (error) {
      console.log(error);
    }
  };

  /* fetch دسته بندی ها */

  const fetchCourses = async () => {
    try {
      const data =
        await questionService.getCourses();

      setCourses(data || []);
    } catch (error) {
      console.log(error);
    }
  };

  /* ثبت سوال */

  const handleCreateQuestion = async (
    values: any
  ) => {
    try {
      await questionService.createQuestion(
        values
      );

      await fetchQuestions();

      setIsModalOpen(false);
    } catch (error) {
      console.log(error);
    }
  };

  /* حذف سوال */

  const handleDeleteQuestion = async (
    id: number
  ) => {
    const confirmDelete = confirm(
      "آیا از حذف این سوال مطمئن هستید؟"
    );

    if (!confirmDelete) return;

    try {
      await questionService.deleteQuestion(
        id
      );

      await fetchQuestions();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <section className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 overflow-hidden rounded-3xl shadow-sm">
          <AdminHeader
            title="پنل مدیریت هوشمند"
            subtitle="مدیریت سوالات و نظرات کاربران"
            actions={
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-100 transition-all hover:-translate-y-0.5 hover:bg-blue-700"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                ثبت سوال جدید
              </button>
            }
          />
        </div>

        {/* tabs */}

        <div className="mb-6 flex gap-2">
          <button
            onClick={() =>
              setActiveTab("questions")
            }
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
              activeTab === "questions"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-500"
            }`}
          >
            مدیریت سوالات (
            {questions.length})
          </button>

          <button
            onClick={() =>
              setActiveTab("comments")
            }
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
              activeTab === "comments"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-500"
            }`}
          >
            نظرات کاربران
          </button>
        </div>

        {/* content */}

        {activeTab === "questions" && (
          <div className="bg-white rounded-2xl shadow-xl p-4">
            {questions.length === 0 ? (
              <EmptyState
                onOpen={() =>
                  setIsModalOpen(true)
                }
              />
            ) : (
              <QuestionTable
                rows={questions}
                onDelete={
                  handleDeleteQuestion
                }
              />
            )}
          </div>
        )}

        {activeTab === "comments" && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center text-gray-500">
            بخش نظرات کاربران در حال توسعه
            است...
          </div>
        )}
      </div>

      {/* modal */}

      <Dialog
        open={isModalOpen}
        onClose={() =>
          setIsModalOpen(false)
        }
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          <QuestionForm
            courses={courses}
            onSubmit={
              handleCreateQuestion
            }
          />
        </DialogContent>
      </Dialog>
    </section>
  );
}