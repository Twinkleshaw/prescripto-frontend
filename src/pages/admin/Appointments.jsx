import { useState, useRef, useEffect } from "react";
import {
  Plus,
  Download,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import clsx from "clsx";
import { useAppointments } from "../../hooks/useAppointment";

// ── helpers ──────────────────────────────────────────────
const STATUS_MAP = {
  completed: {
    label: "Confirmed",
    cls: "bg-green-50  text-green-600  border-green-200",
  },
  booked: {
    label: "Pending",
    cls: "bg-amber-50  text-amber-600  border-amber-200",
  },
  cancelled: {
    label: "Cancelled",
    cls: "bg-red-50    text-red-500    border-red-200",
  },
};

function fmt(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function fmtTime(t) {
  if (!t) return "—";
  const [h, m] = t.split(":");
  const hour = parseInt(h, 10);
  return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? "PM" : "AM"}`;
}

function getInitials(name = "") {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// Avatar colors cycling
const AVATAR_COLORS = [
  "bg-teal-100 text-primary",
  "bg-violet-100 text-violet-600",
  "bg-amber-100 text-amber-700",
  "bg-blue-100 text-blue-600",
  "bg-pink-100 text-pink-600",
];

// Fake monthly chart data (replace with real API if available)
const CHART_MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL"];
const CHART_POINTS = [30, 55, 35, 60, 80, 65, 75]; // % heights

// ── Action dropdown ───────────────────────────────────────
function ActionMenu({ appt, onComplete, onCancel, loading }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isDone = appt.status === "completed" || appt.status === "cancelled";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={loading || isDone}
        className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition-colors"
      >
        <MoreVertical size={13} className="text-gray-400" />
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-50 w-44 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <button
            onClick={() => {
              onComplete(appt._id);
              setOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-medium text-green-600 hover:bg-green-50 transition-colors"
          >
            <CheckCircle2 size={13} /> Mark as Complete
          </button>
          <button
            onClick={() => {
              onCancel(appt._id);
              setOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            <XCircle size={13} /> Cancel Appointment
          </button>
        </div>
      )}
    </div>
  );
}

// ── Smooth SVG line chart ─────────────────────────────────
function LineChart() {
  const W = 380,
    H = 130,
    pad = 20;
  const xs = CHART_MONTHS.map(
    (_, i) => pad + (i / (CHART_MONTHS.length - 1)) * (W - pad * 2),
  );
  const ys = CHART_POINTS.map((p) => H - pad - (p / 100) * (H - pad * 2));

  // Build smooth cubic bezier path
  let d = `M ${xs[0]} ${ys[0]}`;
  for (let i = 1; i < xs.length; i++) {
    const cpx = (xs[i - 1] + xs[i]) / 2;
    d += ` C ${cpx} ${ys[i - 1]}, ${cpx} ${ys[i]}, ${xs[i]} ${ys[i]}`;
  }

  // Fill area
  const fill = d + ` L ${xs[xs.length - 1]} ${H - pad} L ${xs[0]} ${H - pad} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
      <defs>
        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0d9488" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#0d9488" stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <path d={fill} fill="url(#chartFill)" />
      <path
        d={d}
        fill="none"
        stroke="#0d9488"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {xs.map((x, i) => (
        <circle key={i} cx={x} cy={ys[i]} r="3.5" fill="#0d9488" />
      ))}
      {CHART_MONTHS.map((m, i) => (
        <text
          key={m}
          x={xs[i]}
          y={H - 2}
          textAnchor="middle"
          fontSize="9"
          fill="#94a3b8"
        >
          {m}
        </text>
      ))}
    </svg>
  );
}

// ── Main Page ─────────────────────────────────────────────
export default function AdminAppointments() {
  const {
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
  } = useAppointments();

  const [chartView, setChartView] = useState("Month");

  // Derive summary counts from loaded data
  const completed = appointments.filter((a) => a.status === "completed").length;
  const pending = appointments.filter((a) => a.status === "booked").length;
  const cancelled = appointments.filter((a) => a.status === "cancelled").length;

  return (
    <div>
      {/* ── Page header ── */}
      <p className="text-xs font-bold text-primary tracking-widest uppercase mb-1">
        Clinical Operations
      </p>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-gray-900">All Appointments</h1>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <Download size={13} /> Export Data
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl transition-colors">
            <Plus size={13} /> New Appointment
          </button>
        </div>
      </div>

      {/* ── Top section: stat card + line chart ── */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {/* Stat card */}
        <div className="col-span-2 bg-white border border-gray-200 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center">
              <svg
                className="w-5 h-5 stroke-primary fill-none"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-full">
              +12.5%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs text-gray-400 font-medium mb-1">
              Total Monthly Appointments
            </p>
            <p className="text-4xl font-bold text-gray-900">
              {total.toLocaleString()}
            </p>
          </div>
          <div className="flex gap-3 mt-4 text-xs">
            <span className="font-bold text-gray-800">
              {completed}{" "}
              <span className="font-normal text-gray-400">Completed</span>
            </span>
            <span className="font-bold text-gray-800">
              {pending}{" "}
              <span className="font-normal text-gray-400">Pending</span>
            </span>
            <span className="font-bold text-gray-800">
              {cancelled}{" "}
              <span className="font-normal text-gray-400">Cancelled</span>
            </span>
          </div>
        </div>

        {/* Line chart */}
        <div className="col-span-3 bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-sm font-bold text-gray-900">
                Monthly Appointment Graph
              </p>
              <p className="text-xs text-gray-400">
                Volume distribution across current quarter
              </p>
            </div>
            <div className="flex gap-1">
              {["Day", "Month", "Year"].map((v) => (
                <button
                  key={v}
                  onClick={() => setChartView(v)}
                  className={clsx(
                    "px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors",
                    chartView === v
                      ? "bg-primary text-white"
                      : "text-gray-500 hover:bg-gray-50",
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
          <div className="h-32 mt-2">
            <LineChart />
          </div>
        </div>
      </div>

      {/* ── Recent Schedule table ── */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {/* Table header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900">Recent Schedule</h2>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
              <svg
                className="w-3 h-3 stroke-gray-400 fill-none shrink-0"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search appointment details"
                className="bg-transparent text-xs text-gray-600 outline-none w-40 placeholder:text-gray-400"
              />
            </div>
            <button className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700">
              <Filter size={12} /> Filter
            </button>
            <button className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700">
              <ArrowUpDown size={12} /> Sort
            </button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-sm text-gray-400">
            Loading appointments...
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-16 text-sm text-red-400">
            {error}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {["Patient", "Doctor", "Date", "Time", "Status", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-5 py-3"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {appointments.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-12 text-sm text-gray-400"
                  >
                    No appointments found.
                  </td>
                </tr>
              ) : (
                appointments.map((appt, idx) => {
                  const statusInfo = STATUS_MAP[appt.status] || {
                    label: appt.status,
                    cls: "bg-gray-100 text-gray-500 border-gray-200",
                  };
                  const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                  const isLoading = actionLoading === appt._id;

                  return (
                    <tr
                      key={appt._id}
                      className={clsx(
                        "hover:bg-gray-50/50 transition-colors",
                        isLoading && "opacity-50",
                      )}
                    >
                      {/* Patient */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={clsx(
                              "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                              avatarColor,
                            )}
                          >
                            {getInitials(
                              appt.patientName || appt.patientId?.name,
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {appt.patientName || appt.patientId?.name || "—"}
                            </p>
                            <p className="text-xs text-gray-400">
                              ID: #
                              {appt.patientId?._id?.slice(-4).toUpperCase() ||
                                "—"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Doctor */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={clsx(
                              "w-2 h-2 rounded-full shrink-0",
                              appt.status === "completed"
                                ? "bg-primary"
                                : appt.status === "booked"
                                  ? "bg-amber-400"
                                  : "bg-red-400",
                            )}
                          />
                          <span className="text-sm text-gray-700">
                            {appt.doctorId?.name || "—"}
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4">
                        <p className="text-sm text-gray-800 font-medium">
                          {fmt(appt.date)}
                        </p>
                      </td>

                      {/* Time */}
                      <td className="px-5 py-4">
                        <div className="inline-flex items-center px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700">
                          {fmtTime(appt.time)}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={clsx(
                            "text-[10px] font-bold px-2.5 py-1 rounded-full border tracking-wide",
                            statusInfo.cls,
                          )}
                        >
                          {statusInfo.label.toUpperCase()}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <ActionMenu
                          appt={appt}
                          onComplete={completeAppointment}
                          onCancel={cancelAppointment}
                          loading={isLoading}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {!loading && !error && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">
              Showing {Math.min((page - 1) * 10 + 1, total)} to{" "}
              {Math.min(page * 10, total)} of {total.toLocaleString()} entries
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronLeft size={13} className="text-gray-400" />
              </button>
              {Array.from(
                { length: Math.min(totalPages, 5) },
                (_, i) => i + 1,
              ).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={clsx(
                    "w-7 h-7 rounded-lg text-xs font-medium border transition-colors",
                    page === n
                      ? "bg-primary text-white border-primary"
                      : "border-gray-200 text-gray-500 hover:bg-gray-50",
                  )}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronRight size={13} className="text-gray-400" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
