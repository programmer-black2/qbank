import api from "@/lib/axios";
import type { AxiosRequestConfig } from "axios";

export type SiteStats = {
  active_users: number;
  held_exams: number;
  total_questions: number;
};

export const getSiteStats = async (): Promise<SiteStats> => {
  const config: AxiosRequestConfig & { _skipAuth: boolean } = {
    _skipAuth: true,
  };

  const response = await api.get("/api/core/site-stats/", {
    ...config,
  });

  return response.data;
};
