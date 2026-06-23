import api, { PublicRequestConfig } from "@/lib/axios";

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

export interface QuestionStatusHistoryItem {
  id: number;
  old_status_code?: string | null;
  old_status_name?: string | null;
  new_status_code: string;
  new_status_name: string;
  changed_by_name: string;
  note?: string | null;
  changed_at: string;
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
  workflow_status_id?: number;
  workflow_status_code?: 'pending' | 'approved' | 'rejected' | string;
  workflow_status_name?: string;
  created_at?: string;
  updated_at?: string;
  media_items?: QuestionMedia[];
  answer_media_items?: QuestionMedia[];
  status_history?: QuestionStatusHistoryItem[];
}

export interface QuestionListResponse {
  count: number;
  next?: string;
  previous?: string;
  results: Question[];
}

export interface StudentQuestionAnswer {
  question_id: number;
  question_type: 'mcq' | 'descriptive';
  descriptive_answer_text?: string | null;
  answer_media_items?: QuestionMedia[];
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

export interface AuthorNotification {
  id: number;
  question_id: number;
  question_text: string;
  status_code: 'approved' | 'rejected' | string;
  status_name: string;
  changed_by_name: string;
  note?: string | null;
  changed_at: string;
}

export interface AuthorDashboardStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface AuthorDashboardResponse {
  stats: AuthorDashboardStats;
  notifications: AuthorNotification[];
}

export interface QuestionReport {
  id: number;
  user_id: number;
  user_name: string;
  user_phone: string;
  question_id: number;
  question_text: string;
  question_type: 'mcq' | 'descriptive' | string;
  difficulty: 'easy' | 'medium' | 'hard' | 'unknown' | string;
  message: string;
  status: 'pending' | 'resolved';
  created_at: string;
  updated_at: string;
}

export interface QuestionReportListResponse {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: QuestionReport[];
}

// ================= QUESTION CRUD =================

export const getQuestions = async (params?: {
  page?: number;
  page_size?: number;
  search?: string;
  exam_type?: number;
  exam_type_id?: number;
  year_id?: number;
  course_id?: number;
  stage_id?: number;
  question_type?: string;
  difficulty?: string;
  workflow_status?: string;
  ordering?: string;
}): Promise<QuestionListResponse> => {
  const token = localStorage.getItem("access");
  const requestParams = params
    ? {
        ...params,
        exam_type_id: params.exam_type_id ?? params.exam_type,
        exam_type: undefined,
      }
    : undefined;

  const response = await api.get("/api/questions/questions/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: requestParams,
  });
  return response.data;
};

export const getAuthorQuestions = async (params?: {
  page?: number;
  page_size?: number;
  search?: string;
  exam_type?: number;
  exam_type_id?: number;
  year_id?: number;
  course_id?: number;
  stage_id?: number;
  question_type?: string;
  difficulty?: string;
  workflow_status?: string;
  ordering?: string;
}): Promise<QuestionListResponse> => {
  const requestParams = params
    ? {
        ...params,
        exam_type_id: params.exam_type_id ?? params.exam_type,
        exam_type: undefined,
      }
    : undefined;

  const response = await api.get("/api/questions/author/questions/", {
    params: requestParams,
  });
  return response.data;
};

export const getAuthorDashboard = async (): Promise<AuthorDashboardResponse> => {
  try {
    const response = await api.get("/api/questions/author/questions/dashboard/");
    return response.data;
  } catch (error) {
    const status = (error as { response?: { status?: number } }).response?.status;

    if (status !== 404) {
      throw error;
    }

    const questionsResponse = await getAuthorQuestions({ page_size: 100 });
    const questions = questionsResponse.results || [];

    return {
      stats: {
        total: questionsResponse.count ?? questions.length,
        pending: questions.filter((question) => question.workflow_status_code === "pending").length,
        approved: questions.filter((question) => question.workflow_status_code === "approved").length,
        rejected: questions.filter((question) => question.workflow_status_code === "rejected").length,
      },
      notifications: questions
        .filter((question) =>
          question.workflow_status_code === "approved" ||
          question.workflow_status_code === "rejected"
        )
        .slice(0, 10)
        .map((question) => ({
          id: Number(question.id),
          question_id: Number(question.id),
          question_text: question.question_text,
          status_code: question.workflow_status_code || "",
          status_name: question.workflow_status_name || "",
          changed_by_name: "ادمین",
          note: null,
          changed_at: question.updated_at || question.created_at || new Date().toISOString(),
        })),
    };
  }
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

export const getAuthorQuestion = async (id: number): Promise<Question> => {
  const response = await api.get(`/api/questions/author/questions/${id}/`);
  return response.data;
};

export const getStudentQuestions = async (params?: {
  page?: number;
  page_size?: number;
  search?: string;
  exam_type?: number;
  exam_type_id?: number;
  year_id?: number;
  course_id?: number;
  stage_id?: number;
  question_type?: string;
  difficulty?: string;
  ordering?: string;
}): Promise<QuestionListResponse> => {
  const requestParams = params
    ? {
        ...params,
        exam_type_id: params.exam_type_id ?? params.exam_type,
        exam_type: undefined,
      }
    : undefined;

  const response = await api.get("/api/questions/student/questions/", {
    params: requestParams,
  });
  return response.data;
};

export const getPublicQuestions = async (params?: {
  page?: number;
  page_size?: number;
  search?: string;
  exam_type?: number;
  exam_type_id?: number;
  year_id?: number;
  course_id?: number;
  stage_id?: number;
  question_type?: string;
  difficulty?: string;
  ordering?: string;
}): Promise<QuestionListResponse> => {
  const requestParams = params
    ? {
        ...params,
        exam_type_id: params.exam_type_id ?? params.exam_type,
        exam_type: undefined,
      }
    : undefined;

  const response = await api.get("/api/questions/public/questions/", {
    params: requestParams,
    _skipAuth: true,
  } as PublicRequestConfig);
  return response.data;
};

export const getStudentQuestionAnswer = async (id: number): Promise<StudentQuestionAnswer> => {
  const response = await api.get<StudentQuestionAnswer>(`/api/questions/student/questions/${id}/answer/`);
  return response.data;
};

export const getPublicQuestionAnswer = async (id: number): Promise<StudentQuestionAnswer> => {
  const response = await api.get<StudentQuestionAnswer>(`/api/questions/public/questions/${id}/answer/`, {
    _skipAuth: true,
  } as PublicRequestConfig);
  return response.data;
};

export const reportStudentQuestion = async (id: number, message: string): Promise<void> => {
  await api.post(`/api/questions/student/questions/${id}/report/`, { message });
};

export const reportPublicQuestion = async (id: number, message: string): Promise<void> => {
  await api.post(`/api/questions/public/questions/${id}/report/`, { message });
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

export const createAuthorQuestion = async (data: Omit<Question, 'id'>): Promise<Question> => {
  const response = await api.post("/api/questions/author/questions/", data);
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

export const updateAuthorQuestion = async (id: number, data: Partial<Question>): Promise<Question> => {
  const response = await api.patch(`/api/questions/author/questions/${id}/`, data);
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

export const deleteAuthorQuestion = async (id: number): Promise<void> => {
  await api.delete(`/api/questions/author/questions/${id}/`);
};

export const uploadQuestionMedia = async (files: File[]): Promise<QuestionMedia[]> => {
  const token = localStorage.getItem("access");
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await api.post("/api/questions/questions/upload-media/", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const uploadAuthorQuestionMedia = async (files: File[]): Promise<QuestionMedia[]> => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await api.post("/api/questions/author/questions/upload-media/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const approveQuestion = async (id: number, note?: string): Promise<Question> => {
  const response = await api.post(`/api/questions/questions/${id}/approve/`, { note });
  return response.data;
};

export const rejectQuestion = async (id: number, note?: string): Promise<Question> => {
  const response = await api.post(`/api/questions/questions/${id}/reject/`, { note });
  return response.data;
};

// ================= QUESTION REPORTS =================

export const getQuestionReports = async (params?: {
  search?: string;
  status?: 'pending' | 'resolved' | '';
  question_id?: number | '';
  user_id?: number | '';
  ordering?: string;
}): Promise<QuestionReport[]> => {
  const response = await api.get<QuestionReport[] | QuestionReportListResponse>(
    "/api/questions/reports/",
    { params },
  );

  if (Array.isArray(response.data)) {
    return response.data;
  }

  return response.data.results || [];
};

export const getQuestionReport = async (id: number): Promise<QuestionReport> => {
  const response = await api.get<QuestionReport>(`/api/questions/reports/${id}/`);
  return response.data;
};

export const updateQuestionReportStatus = async (
  id: number,
  status: QuestionReport['status'],
): Promise<QuestionReport> => {
  const response = await api.patch<QuestionReport>(`/api/questions/reports/${id}/`, {
    status,
  });

  return response.data;
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
  const response = await api.get("/api/questions/categories/stages/");
  return response.data;
};

export const getCourses = async (stageId?: number) => {
  const params = stageId ? { stage_id: stageId } : undefined;
  const response = await api.get("/api/questions/categories/courses/", {
    params,
  });
  return response.data;
};

export const getYears = async (courseId?: number) => {
  const params = courseId ? { course_id: courseId } : undefined;
  const response = await api.get("/api/questions/categories/years/", {
    params,
  });
  return response.data;
};

export const getExamTypes = async (yearId?: number) => {
  const params = yearId ? { year_id: yearId } : undefined;
  const response = await api.get("/api/questions/categories/exam-types/", {
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
