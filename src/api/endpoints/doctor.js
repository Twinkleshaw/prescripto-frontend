import api from "../axiosInstance";

export const doctorList = () => api.get("admin/doctors");
