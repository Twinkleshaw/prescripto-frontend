import api from "../axiosInstance";

export const getAdminDashboardApi = () => api.get("/admin/dashboard");

// Expected response shape — ask backend to build this:
// {
//   totalDoctors: 1284,
//   totalPatients: 18590,
//   totalAppointments: 9482,
//   recentAppointments: [ ...appointment objects ]
// }
