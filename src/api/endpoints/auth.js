import api from "../axiosInstance";

export const loginApi = (credentials) => api.post("auth/login", credentials);

export const updateAdminProfileApi = (data) => api.put("/admin/profile", data);

export const changePasswordApi = (data) =>
  api.put("/admin/change-password", data);
