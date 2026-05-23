import api from "../axiosInstance";

export const getAppointmentsApi = (params) =>
  api.get("/appointment/appointments-list", { params });

export const getPatientsSummary = () => api.get("/admin/getAdminPatients");

export const cancelAppointmentApi = (id) =>
  api.patch(`/appointment/appointments/${id}/cancel`);

export const completeAppointmentApi = (id) =>
  api.patch(`/appointment/${id}/complete`);
