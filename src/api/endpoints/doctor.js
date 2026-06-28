import api from "../axiosInstance";

export const doctorList = ({ page, limit }) =>
  api.get("admin/doctors", { params: { page, limit } });
export const deleteDoctor = (id) => api.delete(`admin/doctor/${id}`);
export const createDoctor = (data) => api.post("/auth/create-doctor", data);

export const updateDoctor = (id, data) =>
  api.put(`/admin/update-doctor/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const doctorUpdateProfile = (data) =>
  api.put(`/doctor/update-profile`, data);

export const getDoctorDashboardApi = () => api.get("/doctor/dashboard");
export const exportDoctorsCSV = () =>
  api.get("/admin/export-csv", {
    responseType: "blob",
  });
