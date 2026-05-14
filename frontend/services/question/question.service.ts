import {
  getQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  uploadQuestionMedia,
  getCategoryTree,
  getQuestionStatistics,
  getStages,
  getCourses,
  getYears,
  getExamTypes,
  // Keep backward compatibility
  getQuestionsApi,
  createQuestionApi,
  deleteQuestionApi,
  getCoursesApi,
} from "./question.api";

export const questionService = {
  // New API methods
  getQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  uploadQuestionMedia,
  
  // Categories
  getCategoryTree,
  getStages,
  getCourses,
  getYears,
  getExamTypes,
  
  // Statistics
  getStatistics: getQuestionStatistics,

  // Backward compatibility (keep old method names)
  getQuestionsApi,
  createQuestionApi,
  deleteQuestionApi,
  getCoursesApi,
};