import axiosInstance from "../axios";

export const getQuestionsApi = async () => {
  const response = await axiosInstance.get(
    "/api/questions/questions/"
  );

  return response.data;
};

export const createQuestionApi = async (
  data: any
) => {
  const response = await axiosInstance.post(
    "/api/questions/questions/",
    data
  );

  return response.data;
};

export const deleteQuestionApi = async (
  id: number
) => {
  const response = await axiosInstance.delete(
    `/api/questions/questions/${id}/`
  );

  return response.data;
};

export const getCoursesApi = async () => {
  const response = await axiosInstance.get(
    "/api/questions/categories/courses/"
  );

  return response.data;
};