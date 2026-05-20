import { useState, useEffect } from "react";
import { getAppointmentsApi } from "../api/endpoints/appointments";
import { cancelAppointmentApi } from "../api/endpoints/appointments";

export const useAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentAppointments, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      // Until backend builds /admin/dashboard summary endpoint,
      // derive stats from existing APIs in parallel
      const { data } = await getAppointmentsApi({ page: 1, limit: 5 });

      setStats({
        totalDoctors: data.totalDoctors ?? "—",
        totalPatients: data.totalPatients ?? "—",
        totalAppointments: data.totalAppointments ?? 0,
        totalOfflinePayments: data?.totalOfflinePayments ?? 0,
        totalPayment: data?.totalPayment ?? 0,
      });
      setRecent(data.appointments ?? []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (id) => {
    setCancellingId(id);
    try {
      await cancelAppointmentApi(id);
      setRecent((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status: "cancelled" } : a)),
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel.");
    } finally {
      setCancellingId(null);
    }
  };

  return {
    stats,
    recentAppointments,
    loading,
    error,
    cancelBooking,
    cancellingId,
  };
};
