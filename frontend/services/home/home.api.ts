import api, { PublicRequestConfig } from "@/lib/axios";

export type SiteStats = {
  active_users: number;
  held_exams: number;
  total_questions: number;
};

export const getSiteStats = async (): Promise<SiteStats> => {
  const config: PublicRequestConfig = {
    _skipAuth: true,
  };

  const response = await api.get("/api/core/site-stats/", {
    ...config,
  });

  return response.data;
};
