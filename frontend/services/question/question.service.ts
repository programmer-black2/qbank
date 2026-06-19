import {
  getQuestions,
  getQuestion,
  getAuthorQuestion,
  getAuthorQuestions,
  getAuthorDashboard,
  createQuestion,
  createAuthorQuestion,
  updateQuestion,
  updateAuthorQuestion,
  deleteQuestion,
  deleteAuthorQuestion,
  uploadQuestionMedia,
  uploadAuthorQuestionMedia,
  approveQuestion,
  rejectQuestion,
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
  getAuthorQuestion,
  getAuthorQuestions,
  getAuthorDashboard,
  createQuestion,
  createAuthorQuestion,
  updateQuestion,
  updateAuthorQuestion,
  deleteQuestion,
  deleteAuthorQuestion,
  uploadQuestionMedia,
  uploadAuthorQuestionMedia,
  approveQuestion,
  rejectQuestion,
  
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
