import api from "@/lib/axios";
import type { AxiosRequestConfig } from "axios";

type AuthRequestConfig = AxiosRequestConfig & {
  _skipAuth?: boolean;
};


// ================= LOGIN =================

interface LoginData {
  phone_or_email: string;
  password: string;
}

export interface StudentRegisterRequestData {
  full_name: string;
  phone: string;
  password: string;
}

export interface StudentVerifyOTPData {
  phone: string;
  code: string;
  device_name?: string;
}

export interface StudentLoginRequestOTPData {
  phone: string;
  password: string;
}

export const loginUser = async (data: LoginData) => {
  const response = await api.post("/api/auth/login/", data);

  return response.data;
};

export const requestStudentRegisterOTP = async (data: StudentRegisterRequestData) => {
  const response = await api.post("/api/auth/student/register/request-otp/", data, {
    _skipAuth: true,
  } as AuthRequestConfig);

  return response.data;
};

export const verifyStudentRegisterOTP = async (data: StudentVerifyOTPData) => {
  const response = await api.post("/api/auth/student/register/verify/", data, {
    _skipAuth: true,
  } as AuthRequestConfig);

  return response.data;
};

export const requestStudentLoginOTP = async (data: StudentLoginRequestOTPData) => {
  const response = await api.post("/api/auth/student/login/request-otp/", data, {
    _skipAuth: true,
  } as AuthRequestConfig);

  return response.data;
};

export const verifyStudentLoginOTP = async (data: StudentVerifyOTPData) => {
  const response = await api.post("/api/auth/student/login/verify/", data, {
    _skipAuth: true,
  } as AuthRequestConfig);

  return response.data;
};


// ================= LOGOUT =================

export const logoutUser = async (refresh: string) => {
  const response = await api.post(
    "/api/auth/logout/",
    {
      refresh,
    },
    {
      _skipAuth: true,
    } as AuthRequestConfig
  );

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
