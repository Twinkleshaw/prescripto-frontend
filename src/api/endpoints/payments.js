import api from "../axiosInstance";

export const initiatePaymentApi = (appointmentId) =>
  api.post("/payment/initiate", { appointmentId });

export const getPaymentStatusApi = (appointmentId) =>
  api.get(`/payment/status/${appointmentId}`);
