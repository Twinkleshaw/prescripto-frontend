import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { loginApi } from "../api/endpoints/auth";

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { setAuth, logout } = useAuthStore();
  const navigate = useNavigate();

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await loginApi(credentials);

      // Adjust these keys to match your API response
      const { token, role, user } = data.data;

      setAuth(user, token, role);

      // Role-based redirect
      if (role === "admin") navigate("/admin/dashboard");
      else if (role === "doctor") navigate("/doctor/dashboard");
      else setError("Unknown role. Contact support.");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = async () => {
    logout();
    navigate("/login");
  };

  return { login, logoutUser, loading, error };
};
