import api from "@/lib/axios";


// ================= LOGIN =================

interface LoginData {
  phone_or_email: string;
  password: string;
}

export const loginUser = async (data: LoginData) => {
  const response = await api.post("/api/auth/login/", data);

  return response.data;
};


// ================= LOGOUT =================

export const logoutUser = async (refresh: string) => {
  const response = await api.post("/api/auth/logout/", {
    refresh,
  });

  return response.data;
};


// ================= GET CURRENT USER =================

export const getCurrentUser = async () => {
  const token = localStorage.getItem("access");

  const response = await api.get("/api/auth/me/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};


// ================= REFRESH TOKEN =================

export const refreshToken = async () => {
  const refresh = localStorage.getItem("refresh");

  const response = await api.post("/api/auth/refresh/", {
    refresh,
  });

  return response.data;
};


// ================= CHANGE PASSWORD =================

interface ChangePasswordData {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

export const changePassword = async (
  data: ChangePasswordData
) => {
  const token = localStorage.getItem("access");

  const response = await api.post(
    "/api/auth/change-password/",
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};