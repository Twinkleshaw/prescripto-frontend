import api from "../axiosInstance";

export const loginApi = (credentials) => api.post("auth/login", credentials);

export const updateAdminProfileApi = (data) => {
  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("phone", data.phone);
  if (data.profileImage) {
    formData.append("profileImage", data.profileImage); // ✅ match backend field name
  }
  return api.put("/admin/profile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const changePasswordApi = (data) =>
  api.put("/admin/change-password", data);
