import { useNavigate } from "react-router-dom";
import {
  Users,
  UserRound,
  CalendarDays,
  Trash2,
  CloudCog,
  Wallet,
  CreditCard,
} from "lucide-react";
import clsx from "clsx";
import { useAdminDashboard } from "../../hooks/useAdminDashboard";
import { useAuthStore } from "../../store/authStore";
import icon1 from "../../assets/admin_dash_1.png";
import icon2 from "../../assets/admin_dash_2.png";
import icon3 from "../../assets/admin_dash_3.png";
import icon4 from "../../assets/admin_dash_4.png";
import icon5 from "../../assets/admin_dash_5.png";

// ── helpers ──────────────────────────────────────────────
function getInitials(name = "") {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const SPECIALITY_COLORS = [
  "bg-[#89F5E8] text-[#00504A]",
  "bg-[#D2E4FF] text-[#00497E]",
  "bg-[#DAE2FD] text-[#3F465C]",
];

function getSpecialityColor(speciality = "") {
  const index =
    speciality.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    SPECIALITY_COLORS.length;

  return SPECIALITY_COLORS[index];
}

function fmtTime(t) {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hour = parseInt(h, 10);
  return `${hour > 12 ? hour - 12 : hour || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
}

const AVATAR_COLORS = [
  "bg-teal-100 text-primary",
  "bg-amber-100 text-amber-700",
  "bg-violet-100 text-violet-600",
  "bg-blue-100 text-blue-600",
  "bg-pink-100 text-pink-600",
];

const STATUS_STYLES = {
  completed: "bg-[#ECFDF5] text-[#059669]",
  booked: "bg-[#FFF7ED] text-[#EA580C]",
  cancelled: "bg-[#FEF2F2] text-[#DC2626]",
};

const STATUS_LABELS = {
  completed: "Completed",
  booked: "Pending",
  cancelled: "Cancelled",
};

const STATUS_DOTS = {
  completed: "bg-[#059669]",
  booked: "bg-[#EA580C]",
  cancelled: "bg-[#DC2626]",
};

// ── Stat Card ─────────────────────────────────────────────
function StatCard({ icon: Icon, iconBg, iconColor, label, value, sub }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <div
        className={clsx(
          "w-11 h-10 rounded-xl flex items-center justify-center mb-3",
          iconBg,
        )}
      >
        {typeof Icon === "string" ? (
          <img src={Icon} alt="icon" className="w-5 h-5" />
        ) : (
          <Icon size={20} className={iconColor} />
        )}
      </div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
        {label}
      </p>
      <p className="text-2xl font-bold text-gray-900">
        {value ?? <span className="text-gray-300">—</span>}
      </p>
      {sub && (
        <p className="text-xs text-green-500 font-medium mt-1.5">{sub}</p>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────
export default function AdminDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const {
    stats,
    recentAppointments,
    loading,
    error,
    cancelBooking,
    cancellingId,
  } = useAdminDashboard();

  const firstName = user?.name || "Admin";

  return (
    <div>
      {/* ── Header ── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-sm text-gray-400 mt-1">
          Welcome back, {firstName}. Here is what's happening today.
        </p>
      </div>

      {/* ── Stats ── */}
      {loading ? (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-2xl p-5 animate-pulse"
            >
              <div className="w-10 h-10 bg-gray-100 rounded-xl mb-3" />
              <div className="h-3 bg-gray-100 rounded w-24 mb-3" />
              <div className="h-7 bg-gray-100 rounded w-20" />
              <div className="h-7 bg-gray-100 rounded w-20" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-5 gap-4 mb-6">
          <StatCard
            icon={icon1}
            iconBg="bg-teal-50"
            iconColor="text-primary"
            label="Listed Doctors"
            value={stats?.totalDoctors?.toLocaleString()}
            // sub="↑ +12 this month"
          />
          <StatCard
            icon={icon5}
            iconBg="bg-[#0078CA1A]"
            iconColor="text-blue-500"
            label="Total Patients"
            value={stats?.totalPatients?.toLocaleString()}
            // sub="↑ +340 this week"
          />
          <StatCard
            icon={icon3}
            iconBg="bg-[#FFDAD666]"
            iconColor="text-orange-500"
            label="Total Appointments"
            value={stats?.totalAppointments?.toLocaleString()}
            // sub="↑ +89 today"
          />
          <StatCard
            icon={icon4}
            iconBg="bg-[#DAE2FD]"
            iconColor="text-[#5C647A]"
            label="Payment Sessions"
            value={stats?.totalCollected?.toLocaleString()}
          />

          <StatCard
            icon={icon2}
            iconBg="bg-[#FFEDD5]"
            iconColor="text-[#FFEDD5]"
            label="Due Payments"
            value={stats?.totalPendingAmount?.toLocaleString()}
          />
        </div>
      )}

      {/* ── Recent Appointments ── */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-gray-900">
          Recent Appointments
        </h2>
        <button
          onClick={() => navigate("/admin/appointments")}
          className="text-xs font-semibold text-primary hover:underline"
        >
          View All Schedule →
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-sm text-gray-400">
            Loading...
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-16 text-sm text-red-400">
            {error}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {[
                  "Patient Name",
                  "Doctor",
                  "Department",
                  "Date & Time",
                  "Status",
                  "Action",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-5 py-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentAppointments.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-12 text-sm text-gray-400"
                  >
                    No recent appointments.
                  </td>
                </tr>
              ) : (
                recentAppointments.map((appt, idx) => {
                  const name =
                    appt.patientName || appt.patientId?.name || "Patient";
                  const isCancelled =
                    appt.status === "cancelled" || appt.status === "completed";
                  const isActioning = cancellingId === appt._id;
                  const statusStyle =
                    STATUS_STYLES[appt.status] || "bg-gray-100 text-gray-500";
                  const statusLabel = STATUS_LABELS[appt.status] || appt.status;
                  const dotColor = STATUS_DOTS[appt.status] || "bg-gray-400";

                  return (
                    <tr
                      key={appt._id}
                      className={clsx(
                        "hover:bg-gray-50/50 transition-colors",
                        isActioning && "opacity-50",
                      )}
                    >
                      {/* Patient */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={clsx(
                              "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                              AVATAR_COLORS[idx % AVATAR_COLORS.length],
                            )}
                          >
                            {getInitials(name)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {name}
                            </p>
                            <p className="text-xs text-gray-400">
                              ID: #
                              {appt.patientId?._id?.slice(-5).toUpperCase() ||
                                "—"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Doctor */}
                      <td className="px-5 py-3 text-sm text-gray-700">
                        {appt.doctorId?.name || "—"}
                      </td>

                      <td className="px-5 py-3">
                        <span
                          className={clsx(
                            "inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold",
                            getSpecialityColor(appt.doctorId?.speciality),
                          )}
                        >
                          {appt.doctorId?.speciality || "—"}
                        </span>
                      </td>

                      {/* Date & Time */}
                      <td className="px-5 py-3">
                        <p className="text-sm text-gray-800 font-medium">
                          {fmtDate(appt.date)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {fmtTime(appt.time)}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3">
                        <span
                          className={clsx(
                            "inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full",
                            statusStyle,
                          )}
                        >
                          <span
                            className={clsx(
                              "w-1.5 h-1.5 rounded-full",
                              dotColor,
                            )}
                          />
                          {statusLabel}
                        </span>
                      </td>

                      {/* Cancel action */}
                      <td className="px-5 py-3">
                        <button
                          onClick={() =>
                            !isCancelled && cancelBooking(appt._id)
                          }
                          disabled={isCancelled || isActioning}
                          title={
                            isCancelled
                              ? "Already cancelled"
                              : "Cancel appointment"
                          }
                          className={clsx(
                            "w-8 h-8 rounded-xl border flex items-center justify-center transition-colors",
                            isCancelled
                              ? "border-gray-200 bg-gray-50 opacity-40 cursor-not-allowed"
                              : "border-red-200 bg-red-50 hover:bg-red-100 cursor-pointer",
                          )}
                        >
                          <Trash2
                            size={13}
                            className={
                              isCancelled ? "text-gray-400" : "text-red-500"
                            }
                          />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
