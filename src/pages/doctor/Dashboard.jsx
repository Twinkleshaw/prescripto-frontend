import { useNavigate } from "react-router-dom";
import {
  UserRound,
  CalendarDays,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import clsx from "clsx";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  cancelAppointmentApi,
  completeAppointmentApi,
} from "../../api/endpoints/appointments";
import { useAuthStore } from "../../store/authStore";
import { useState } from "react";
import { getDoctorDashboardApi } from "../../api/endpoints/doctor";

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

function fmtTime(t) {
  if (!t) return "—";
  const [h, m] = t.split(":");
  const hour = parseInt(h, 10);
  return `${hour > 12 ? hour - 12 : hour || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
}

function fmtMoney(val) {
  return `₹${Number(val || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

const AVATAR_COLORS = [
  "bg-teal-100 text-primary",
  "bg-amber-100 text-amber-700",
  "bg-violet-100 text-violet-600",
  "bg-blue-100 text-blue-600",
  "bg-pink-100 text-pink-600",
];

const APPT_STATUS = {
  completed: {
    label: "Completed",
    cls: "bg-teal-50 text-primary",
    dot: "bg-primary",
  },
  booked: {
    label: "Pending",
    cls: "bg-amber-50 text-amber-600",
    dot: "bg-amber-400",
  },
  cancelled: {
    label: "Cancelled",
    cls: "bg-red-50 text-red-500",
    dot: "bg-red-400",
  },
};

const PAY_STATUS = {
  paid: { label: "Paid", cls: "bg-teal-50 text-primary" },
  pending: { label: "Pending", cls: "bg-amber-50 text-amber-600" },
};

const PAY_TYPE = {
  pay_at_clinic: "Cash",
  online: "Online",
  stripe: "Stripe",
  razorpay: "Razorpay",
};

// ── Skeleton ──────────────────────────────────────────────
function Skeleton({ className }) {
  return (
    <div className={clsx("animate-pulse bg-gray-100 rounded-xl", className)} />
  );
}

// ── Stat Card ─────────────────────────────────────────────
function StatCard({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  sub,
  loading,
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <div
        className={clsx(
          "w-10 h-10 rounded-xl flex items-center justify-center mb-3",
          iconBg,
        )}
      >
        <Icon size={18} className={iconColor} />
      </div>
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
        {label}
      </p>
      {loading ? (
        <Skeleton className="h-7 w-20 mt-1" />
      ) : (
        <p className="text-2xl font-bold text-gray-900">{value ?? "—"}</p>
      )}
      {sub && !loading && (
        <p className="text-xs text-gray-400 font-medium mt-1">{sub}</p>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────
export default function DoctorDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [actioningId, setActioningId] = useState(null);

  const firstName = user?.name?.split(" ")[0] || "Doctor";

  // ── Fetch dashboard ───────────────────────────────────
  const { data, isLoading, isError } = useQuery({
    queryKey: ["doctorDashboard"],
    queryFn: getDoctorDashboardApi,
  });

  const d = data?.data;
  console.log(d);

  // ── Cancel ────────────────────────────────────────────
  const { mutate: cancelMutate } = useMutation({
    mutationFn: cancelAppointmentApi,
    onMutate: (id) => setActioningId(id),
    onSettled: () => setActioningId(null),
    onSuccess: () => queryClient.invalidateQueries(["doctorDashboard"]),
    onError: (err) =>
      alert(err?.response?.data?.message || "Failed to cancel."),
  });

  // ── Complete ──────────────────────────────────────────
  const { mutate: completeMutate } = useMutation({
    mutationFn: completeAppointmentApi,
    onMutate: (id) => setActioningId(id),
    onSettled: () => setActioningId(null),
    onSuccess: () => queryClient.invalidateQueries(["doctorDashboard"]),
    onError: (err) =>
      alert(err?.response?.data?.message || "Failed to complete."),
  });

  return (
    <div>
      {/* ── Header ── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Clinic Overview</h1>
        <p className="text-sm text-gray-400 mt-1">
          Welcome back, Dr. {firstName}. Here is what's happening today.
        </p>
      </div>

      {/* ── Stats Row ── */}
      {/* ── Stats Row ── */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        <StatCard
          icon={UserRound}
          iconBg="bg-teal-50"
          iconColor="text-primary"
          label="Total Patients"
          value={d?.totalPatients?.toLocaleString()}
          sub="Unique patients"
          loading={isLoading}
        />
        <StatCard
          icon={CalendarDays}
          iconBg="bg-orange-50"
          iconColor="text-orange-500"
          label="Today's Appointments"
          value={d?.todayAppointments?.toLocaleString()}
          sub="Scheduled today"
          loading={isLoading}
        />
        <StatCard
          icon={Clock}
          iconBg="bg-blue-50"
          iconColor="text-blue-500"
          label="Today's Earnings"
          value={d?.todayEarnings?.toLocaleString()}
          sub="Digital payments"
          loading={isLoading}
        />
        <StatCard
          icon={CreditCard}
          iconBg="bg-green-50"
          iconColor="text-green-500"
          label="Total Earnings"
          value={d?.totalEarnings}
          sub="Cash collected"
          loading={isLoading}
        />
      </div>

      {/* ── Latest Bookings ── */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-gray-900">Latest Bookings</h2>
        <button
          onClick={() => navigate("/doctor/appointments")}
          className="text-xs font-semibold text-primary hover:underline"
        >
          View All →
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center py-14 text-sm text-red-400">
            Failed to load dashboard.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {[
                  "Patient",
                  "Date & Time",
                  "Token",
                  "Payment",
                  "Status",
                  "Actions",
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
              {!d?.latestBookings || d.latestBookings.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-12 text-sm text-gray-400"
                  >
                    No bookings yet.
                  </td>
                </tr>
              ) : (
                d.latestBookings.map((appt, idx) => {
                  const apptStatus = APPT_STATUS[appt.status] || {
                    label: appt.status,
                    cls: "bg-gray-100 text-gray-500",
                    dot: "bg-gray-400",
                  };
                  const payStatus = PAY_STATUS[appt.paymentStatus] || {
                    label: appt.paymentStatus,
                    cls: "bg-gray-100 text-gray-500",
                  };
                  const isDone =
                    appt.status === "completed" || appt.status === "cancelled";
                  const isActioning = actioningId === appt._id;

                  return (
                    <tr
                      key={appt._id}
                      className={clsx(
                        "hover:bg-gray-50/50 transition-colors",
                        isActioning && "opacity-50",
                      )}
                    >
                      {/* Patient */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={clsx(
                              "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
                              AVATAR_COLORS[idx % AVATAR_COLORS.length],
                            )}
                          >
                            {getInitials(appt.patientName || "")}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 capitalize">
                              {appt.patientName || "—"}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              Age: {appt.patientAge ?? "—"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-medium text-gray-800">
                          {fmtDate(appt.date)}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {fmtTime(appt.time)}
                        </p>
                      </td>

                      {/* Token */}
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg">
                          #{appt.tokenNumber ?? "—"}
                        </span>
                      </td>

                      {/* Payment */}
                      <td className="px-5 py-3.5">
                        <p className="text-xs font-medium text-gray-700">
                          {PAY_TYPE[appt.paymentType] ?? appt.paymentType}
                        </p>
                        <span
                          className={clsx(
                            "inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full mt-0.5",
                            payStatus.cls,
                          )}
                        >
                          <span className="w-1 h-1 rounded-full bg-current" />
                          {payStatus.label}
                        </span>
                      </td>

                      {/* Appt Status */}
                      <td className="px-5 py-3.5">
                        <span
                          className={clsx(
                            "inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full",
                            apptStatus.cls,
                          )}
                        >
                          <span
                            className={clsx(
                              "w-1.5 h-1.5 rounded-full",
                              apptStatus.dot,
                            )}
                          />
                          {apptStatus.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => !isDone && completeMutate(appt._id)}
                            disabled={isDone || isActioning}
                            title="Mark as complete"
                            className={clsx(
                              "w-7 h-7 rounded-lg border flex items-center justify-center transition-colors",
                              isDone
                                ? "border-gray-200 bg-gray-50 opacity-40 cursor-not-allowed"
                                : "border-teal-200 bg-teal-50 hover:bg-teal-100 cursor-pointer",
                            )}
                          >
                            <CheckCircle2
                              size={12}
                              className={
                                isDone ? "text-gray-400" : "text-primary"
                              }
                            />
                          </button>
                          <button
                            onClick={() => !isDone && cancelMutate(appt._id)}
                            disabled={isDone || isActioning}
                            title="Cancel appointment"
                            className={clsx(
                              "w-7 h-7 rounded-lg border flex items-center justify-center transition-colors",
                              isDone
                                ? "border-gray-200 bg-gray-50 opacity-40 cursor-not-allowed"
                                : "border-red-200 bg-red-50 hover:bg-red-100 cursor-pointer",
                            )}
                          >
                            <XCircle
                              size={12}
                              className={
                                isDone ? "text-gray-400" : "text-red-500"
                              }
                            />
                          </button>
                        </div>
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
