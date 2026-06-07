import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import AdminLayout from "../components/shared/AdminLayout";
import DoctorLayout from "../components/shared/DoctorLayout";
import AdminDashboard from "../pages/admin/Dashboard";
import DoctorDashboard from "../pages/doctor/Dashboard";
import Login from "../pages/auth/login";
import AdminDoctors from "../pages/admin/Doctors";
import AdminPatients from "../pages/admin/Patients";
import AdminAppointments from "../pages/admin/Appointments";
import DoctorProfile from "../pages/doctor/Profile";
import DoctorAppointments from "../pages/doctor/Appointment";
import DoctorPayment from "../pages/doctor/Payment";
import Settings from "../pages/admin/Settings";
import Finance from "../pages/admin/Finance";
import Invoices from "../pages/admin/Invoices";
import JoinAsDoctor from "../pages/JoinAsDoctor";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import RefundPolicy from "../pages/RefundPolicy";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/join-as-doctor" element={<JoinAsDoctor />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="doctors" element={<AdminDoctors />} />
          <Route path="patients" element={<AdminPatients />} />
          <Route path="appointments" element={<AdminAppointments />} />
          <Route path="settings" element={<Settings />} />
          <Route path="financials" element={<Finance />} />
          <Route path="invoices" element={<Invoices />} />
          {/* Add admin pages here as nested routes */}
        </Route>

        {/* Doctor */}
        <Route
          path="/doctor"
          element={
            <ProtectedRoute allowedRole="doctor">
              <DoctorLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DoctorDashboard />} />
          <Route path="settings" element={<DoctorProfile />} />
          <Route path="appointments" element={<DoctorAppointments />} />
          <Route path="payments" element={<DoctorPayment />} />
          {/* Add doctor pages here as nested routes */}
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
