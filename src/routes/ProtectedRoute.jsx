import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function ProtectedRoute({ children, allowedRole }) {
  const { token, role } = useAuthStore();

  if (!token) return <Navigate to="/login" replace />;
  if (allowedRole && role !== allowedRole)
    return <Navigate to="/login" replace />;

  return children;
}