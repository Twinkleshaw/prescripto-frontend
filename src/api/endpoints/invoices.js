import api from "../axiosInstance";

// in your api services file
export const getInvoices = () => api.get("/admin/invoices");

export const downloadInvoicePDF = (appointmentId) =>
  api.get(`/appointment/${appointmentId}/invoice`, { responseType: "blob" });

export const exportFinanceCSV = () =>
  api.get("/admin/payments/export", { responseType: "blob" });

export const getFinanceData = () => api.get("/admin/payments");
