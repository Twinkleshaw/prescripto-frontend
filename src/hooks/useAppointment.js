import { useState, useEffect, useCallback } from "react";
import {
  getAppointmentsApi,
  cancelAppointmentApi,
  completeAppointmentApi,
} from "../api/endpoints/appointments";

export const useAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // id of row being actioned
  const [error, setError] = useState(null);
  const limit = 10;

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getAppointmentsApi({ page, limit, search });
      setAppointments(data.appointments);
      setTotal(data.count ?? data.total ?? 0);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load appointments.");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleSearch = (val) => {
    setSearch(val);
    setPage(1);
  };

  const cancelAppointment = async (id) => {
    setActionLoading(id);
    try {
      await cancelAppointmentApi(id);
      setAppointments((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status: "cancelled" } : a)),
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel.");
    } finally {
      setActionLoading(null);
    }
  };

  const completeAppointment = async (id) => {
    setActionLoading(id);
    try {
      await completeAppointmentApi(id);
      setAppointments((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status: "completed" } : a)),
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to complete.");
    } finally {
      setActionLoading(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    appointments,
    total,
    page,
    setPage,
    search,
    handleSearch,
    loading,
    error,
    totalPages,
    cancelAppointment,
    completeAppointment,
    actionLoading,
  };
};
