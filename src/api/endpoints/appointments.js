import api from "../axiosInstance";

export const getAppointmentsApi = (params) =>
  api.get("/appointment/appointments-list", { params });

export const getPatientsSummary = (params) =>
  api.get("/admin/getAdminPatients", { params });

export const cancelAppointmentApi = (id) =>
  api.patch(`/appointment/appointments/${id}/cancel`);

export const completeAppointmentApi = (id) =>
  api.patch(`/appointment/${id}/complete`);

export const exportAppointmentCSV = () =>
  api.get("/appointment/export/csv", {
    responseType: "blob",
  });
