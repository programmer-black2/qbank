import api, { PublicRequestConfig } from "@/lib/axios";

// ================= INTERFACES =================

export interface EducationStage {
  id: number;
  name_education_stage: string;
  courses_count?: number;
}

export interface Course {
  id: number;
  name_course: string;
  stage_id?: number;
  stage_name?: string;
  years_count?: number;
  is_public_sample?: boolean;
}

export interface Year {
  id: number;
  years_number: number;
  course_id?: number;
  course_name?: string;
  exam_types_count?: number;
}

export interface ExamType {
  id: number;
  name_exam_types: string;
  year_id?: number;
  year_number?: number;
  course_name?: string;
  stage_name?: string;
  questions_count?: number;
}

export interface CategoryNode {
  id: number;
  name: string;
  type: 'stage' | 'course' | 'year' | 'exam_type';
  children?: CategoryNode[];
  question_count?: number;
  metadata?: {
    year_id?: number;
    course_id?: number;
    stage_id?: number;
    name_exam_types?: string;
    year_number?: number;
    course_name?: string;
    stage_name?: string;
  };
}

export interface BreadcrumbItem {
  id: number;
  name: string;
  type: string;
}

const publicRequestConfig: PublicRequestConfig = {
  _skipAuth: true,
};

// ================= EDUCATION STAGES =================

export const getEducationStages = async (): Promise<EducationStage[]> => {
  const response = await api.get("/api/core/education-stages/", publicRequestConfig);
  return response.data;
};

export const createEducationStage = async (data: Omit<EducationStage, 'id' | 'courses_count'>): Promise<EducationStage> => {
  const token = localStorage.getItem("access");
  const response = await api.post("/api/core/education-stages/", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const updateEducationStage = async (id: number, data: Partial<EducationStage>): Promise<EducationStage> => {
  const token = localStorage.getItem("access");
  const response = await api.patch(`/api/core/education-stages/${id}/`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const deleteEducationStage = async (id: number): Promise<void> => {
  const token = localStorage.getItem("access");
  await api.delete(`/api/core/education-stages/${id}/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ================= COURSES =================

export const getCourses = async (): Promise<Course[]> => {
  const response = await api.get("/api/core/courses/", publicRequestConfig);
  return response.data;
};

export const createCourse = async (data: Omit<Course, 'id' | 'stage_name' | 'years_count'>): Promise<Course> => {
  const token = localStorage.getItem("access");
  const response = await api.post("/api/core/courses/", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const updateCourse = async (id: number, data: Partial<Course>): Promise<Course> => {
  const token = localStorage.getItem("access");
  const response = await api.patch(`/api/core/courses/${id}/`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const updatePublicSampleCourses = async (data: {
  course_ids: number[];
  is_public_sample: boolean;
}): Promise<Course[]> => {
  const token = localStorage.getItem("access");
  const response = await api.post("/api/core/courses/public-samples/", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const deleteCourse = async (id: number): Promise<void> => {
  const token = localStorage.getItem("access");
  await api.delete(`/api/core/courses/${id}/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ================= YEARS =================

export const getYears = async (): Promise<Year[]> => {
  const response = await api.get("/api/core/years/", publicRequestConfig);
  return response.data;
};

export const createYear = async (data: Omit<Year, 'id' | 'course_name' | 'exam_types_count'>): Promise<Year> => {
  const token = localStorage.getItem("access");
  const response = await api.post("/api/core/years/", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const updateYear = async (id: number, data: Partial<Year>): Promise<Year> => {
  const token = localStorage.getItem("access");
  const response = await api.patch(`/api/core/years/${id}/`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const deleteYear = async (id: number): Promise<void> => {
  const token = localStorage.getItem("access");
  await api.delete(`/api/core/years/${id}/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ================= EXAM TYPES =================

export const getExamTypes = async (): Promise<ExamType[]> => {
  const response = await api.get("/api/core/exam-types/", publicRequestConfig);
  return response.data;
};

export const createExamType = async (data: Omit<ExamType, 'id' | 'year_number' | 'course_name' | 'stage_name' | 'questions_count'>): Promise<ExamType> => {
  const token = localStorage.getItem("access");
  const response = await api.post("/api/core/exam-types/", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const updateExamType = async (id: number, data: Partial<ExamType>): Promise<ExamType> => {
  const token = localStorage.getItem("access");
  const response = await api.patch(`/api/core/exam-types/${id}/`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const deleteExamType = async (id: number): Promise<void> => {
  const token = localStorage.getItem("access");
  await api.delete(`/api/core/exam-types/${id}/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ================= CATEGORY TREE =================

export const getCategoryTree = async (): Promise<CategoryNode[]> => {
  const response = await api.get("/api/core/category-tree/", publicRequestConfig);
  return response.data;
};

export const getCategoryBreadcrumb = async (params: {
  exam_type_id?: number;
  year_id?: number;
  course_id?: number;
  stage_id?: number;
}): Promise<BreadcrumbItem[]> => {
  const response = await api.get("/api/core/category-breadcrumb/", {
    ...publicRequestConfig,
    params,
  });
  return response.data;
};
