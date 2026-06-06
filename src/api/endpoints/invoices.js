import api from "../axiosInstance";

// in your api services file
export const getInvoices = () => api.get("/admin/invoices");

export const downloadInvoicePDF = (appointmentId) =>
  api.get(`/appointment/${appointmentId}/invoice`, { responseType: "blob" });
