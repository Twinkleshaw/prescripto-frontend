import api from "../axiosInstance";

export const getPatientsApi = (params) =>
  api.get("/admin/patients", { params });

export const getPatientByIdApi = (id) => api.get(`/patient/${id}`);
