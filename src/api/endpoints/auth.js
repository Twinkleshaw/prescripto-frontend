import api from "../axiosInstance";

export const loginApi = (credentials) => api.post("auth/login", credentials);
