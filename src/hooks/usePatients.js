import { useState, useEffect, useCallback } from "react";
import { getPatientsApi } from "../api/endpoints/patient";

export const usePatients = () => {
  const [patients, setPatients] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const limit = 10;

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getPatientsApi({ page, limit, search });
      setPatients(data.patients);
      setTotal(data.total);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load patients.");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Reset to page 1 when search changes
  const handleSearch = (val) => {
    setSearch(val);
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit);

  return {
    patients,
    total,
    page,
    setPage,
    search,
    handleSearch,
    loading,
    error,
    totalPages,
    limit,
  };
};
