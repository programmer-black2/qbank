import api from "@/lib/axios";

// ================= INTERFACES =================

export interface QuestionChoice {
  id?: number;
  option_text: string;
  option_number: number;
  is_correct: boolean;
}

export interface QuestionAnswer {
  id?: number;
  descriptive_answer_text: string;
}

export interface QuestionMedia {
  id?: number;
  media_type: 'image' | 'audio' | 'video' | 'pdf' | 'document';
  file_url: string;
  original_file_name?: string;
  alt_text?: string;
}

export interface ExamTypeDetail {
  id: number;
  name_exam_types: string;
  year_number: number;
  course_name: string;
  stage_name: string;
}

export interface Question {
  id?: number;
  question_text: string;
  question_type: 'mcq' | 'descriptive';
  difficulty: 'easy' | 'medium' | 'hard' | 'unknown';
  exam_type_id: number;
  choices?: QuestionChoice[];
  answer?: QuestionAnswer;
  question_media?: QuestionMedia[];
  answer_media?: QuestionMedia[];
  
  // Read-only fields
  exam_type_detail?: ExamTypeDetail;
  exam_type_name?: string;
  year_number?: number;
  course_name?: string;
  stage_name?: string;
  created_by_name?: string;
  question_type_display?: string;
  difficulty_display?: string;
  created_at?: string;
  updated_at?: string;
  media_items?: QuestionMedia[];
  answer_media_items?: QuestionMedia[];
}

export interface QuestionListResponse {
  count: number;
  next?: string;
  previous?: string;
  results: Question[];
}

export interface CategoryTreeNode {
  id: number;
  name: string;
  type: 'stage' | 'course' | 'year' | 'exam_type';
  children?: CategoryTreeNode[];
  question_count?: number;
}

export interface QuestionStatistics {
  total_questions: number;
  mcq_count: number;
  descriptive_count: number;
  difficulty_stats: {
    easy: number;
    medium: number;
    hard: number;
    unknown: number;
  };
  today_questions: number;
}

// ================= QUESTION CRUD =================

export const getQuestions = async (params?: {
  page?: number;
  page_size?: number;
  search?: string;
  exam_type?: number;
  question_type?: string;
  difficulty?: string;
  ordering?: string;
}): Promise<QuestionListResponse> => {
  const token = localStorage.getItem("access");
  const response = await api.get("/api/questions/questions/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params,
  });
  return response.data;
};

export const getQuestion = async (id: number): Promise<Question> => {
  const token = localStorage.getItem("access");
  const response = await api.get(`/api/questions/questions/${id}/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const createQuestion = async (data: Omit<Question, 'id'>): Promise<Question> => {
  const token = localStorage.getItem("access");
  const response = await api.post("/api/questions/questions/", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const updateQuestion = async (id: number, data: Partial<Question>): Promise<Question> => {
  const token = localStorage.getItem("access");
  const response = await api.patch(`/api/questions/questions/${id}/`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const deleteQuestion = async (id: number): Promise<void> => {
  const token = localStorage.getItem("access");
  await api.delete(`/api/questions/questions/${id}/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ================= CATEGORY TREE =================

export const getCategoryTree = async (): Promise<CategoryTreeNode[]> => {
  const token = localStorage.getItem("access");
  const response = await api.get("/api/questions/questions/category-tree/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// ================= STATISTICS =================

export const getQuestionStatistics = async (): Promise<QuestionStatistics> => {
  const token = localStorage.getItem("access");
  const response = await api.get("/api/questions/questions/statistics/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// ================= CATEGORIES (for dropdowns) =================

export const getStages = async () => {
  const token = localStorage.getItem("access");
  const response = await api.get("/api/questions/categories/stages/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getCourses = async (stageId?: number) => {
  const token = localStorage.getItem("access");
  const params = stageId ? { stage_id: stageId } : undefined;
  const response = await api.get("/api/questions/categories/courses/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params,
  });
  return response.data;
};

export const getYears = async (courseId?: number) => {
  const token = localStorage.getItem("access");
  const params = courseId ? { course_id: courseId } : undefined;
  const response = await api.get("/api/questions/categories/years/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params,
  });
  return response.data;
};

export const getExamTypes = async (yearId?: number) => {
  const token = localStorage.getItem("access");
  const params = yearId ? { year_id: yearId } : undefined;
  const response = await api.get("/api/questions/categories/exam-types/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params,
  });
  return response.data;
};

// ================= BACKWARD COMPATIBILITY =================
// Keep old function names for existing components

export const getQuestionsApi = getQuestions;
export const createQuestionApi = createQuestion;
export const deleteQuestionApi = deleteQuestion;
export const getCoursesApi = getCourses;