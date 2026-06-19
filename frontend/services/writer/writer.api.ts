import api from "@/lib/axios";

export interface WriterUser {
  id: number;
  full_name: string;
  phone: string;
  email?: string | null;
  role_name?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface WriterListResponse {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: WriterUser[];
}

export interface WriterPayload {
  full_name: string;
  phone: string;
  password?: string;
  is_active: boolean;
}

export const getWriters = async (params?: {
  search?: string;
  ordering?: string;
}): Promise<WriterUser[]> => {
  const response = await api.get<WriterListResponse | WriterUser[]>("/api/writers/", {
    params,
  });

  if (Array.isArray(response.data)) {
    return response.data;
  }

  return response.data.results || [];
};

export const createWriter = async (payload: WriterPayload): Promise<WriterUser> => {
  const response = await api.post<WriterUser>("/api/writers/", payload);
  return response.data;
};

export const updateWriter = async (
  id: number,
  payload: WriterPayload,
): Promise<WriterUser> => {
  const response = await api.patch<WriterUser>(`/api/writers/${id}/`, payload);
  return response.data;
};

export const deleteWriter = async (id: number): Promise<void> => {
  await api.delete(`/api/writers/${id}/`);
};
