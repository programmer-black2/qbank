import {
  getQuestionsApi,
  createQuestionApi,
  deleteQuestionApi,
  getCoursesApi,
} from "./question.api";

export const questionService = {
  getQuestions: getQuestionsApi,

  createQuestion: createQuestionApi,

  deleteQuestion: deleteQuestionApi,

  getCourses: getCoursesApi,
};