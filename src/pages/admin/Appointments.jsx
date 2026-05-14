import { useState, useRef, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import clsx from "clsx";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAppointmentsApi,
  cancelAppointmentApi,
  completeAppointmentApi,
} from "../../api/endpoints/appointments";

// ── helpers ──────────────────────────────────────────────
const STATUS_MAP = {
  completed: {
    label: "Completed",
    cls: "bg-[#DCFCE7] text-[#15803D] border-[#DCFCE7]",
  },
  booked: {
    label: "Pending",
    cls: "bg-[#FEF3C7] text-[#B45309] border-[#FEF3C7]",
  },
  cancelled: {
    label: "Cancelled",
    cls: "bg-[#FEE2E2] text-[#B91C1C] border-[#FEE2E2]",
  },
};

const AVATAR_COLORS = [
  "bg-teal-100 text-primary",
  "bg-violet-100 text-violet-600",
  "bg-amber-100 text-amber-700",
  "bg-blue-100 text-blue-600",
  "bg-pink-100 text-pink-600",
];

function fmt(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
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

function getInitials(name = "") {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// ── Action dropdown ───────────────────────────────────────
function ActionMenu({ appt, onComplete, onCancel, loadingId }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const isLoading = loadingId === appt._id;
  const isDone = appt.status === "completed" || appt.status === "cancelled";

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={isLoading || isDone}
        className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition-colors"
      >
        <MoreVertical size={13} className="text-gray-400" />
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-50 w-48 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
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

// ── Main Page ─────────────────────────────────────────────
export default function AdminAppointments() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState(null);
  const queryClient = useQueryClient();
  const limit = 10;

  // ── Fetch ─────────────────────────────────────────────
  const { data, isLoading, isError } = useQuery({
    queryKey: ["appointments", page, search],
    queryFn: () => getAppointmentsApi({ page, limit, search }),
    keepPreviousData: true,
  });

  const appointments = data?.data?.appointments ?? [];
  const total = data?.data?.totalAppointments ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  // Counts derived from current page data
  const completed = appointments.filter((a) => a.status === "completed").length;
  const pending = appointments.filter((a) => a.status === "booked").length;
  const cancelled = appointments.filter((a) => a.status === "cancelled").length;

  // ── Cancel ────────────────────────────────────────────
  const { mutate: cancelMutate } = useMutation({
    mutationFn: cancelAppointmentApi,
    onMutate: (id) => setLoadingId(id),
    onSettled: () => setLoadingId(null),
    onSuccess: () => queryClient.invalidateQueries(["appointments"]),
    onError: (err) =>
      alert(err?.response?.data?.message || "Failed to cancel."),
  });

  // ── Complete ──────────────────────────────────────────
  const { mutate: completeMutate } = useMutation({
    mutationFn: completeAppointmentApi,
    onMutate: (id) => setLoadingId(id),
    onSettled: () => setLoadingId(null),
    onSuccess: () => queryClient.invalidateQueries(["appointments"]),
    onError: (err) =>
      alert(err?.response?.data?.message || "Failed to complete."),
  });

  const handleSearch = (val) => {
    setSearch(val);
    setPage(1);
  };

  return (
    <div>
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Appointments</h1>
          <p className="text-sm text-gray-400 mt-1">
            View and manage all patient appointments
          </p>
        </div>
      </div>

      {/* ── Summary stat card ── */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
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
            <div>
              <p className="text-xs text-gray-400 font-medium">
                Total Appointments
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {total.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Status breakdown */}
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-xl font-bold text-primary">{completed}</p>
              <p className="text-xs text-gray-400">Completed</p>
            </div>
            <div className="w-px bg-gray-100" />
            <div className="text-center">
              <p className="text-xl font-bold text-amber-500">{pending}</p>
              <p className="text-xs text-gray-400">Pending</p>
            </div>
            <div className="w-px bg-gray-100" />
            <div className="text-center">
              <p className="text-xl font-bold text-red-400">{cancelled}</p>
              <p className="text-xs text-gray-400">Cancelled</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {/* Table toolbar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900">Appointment List</h2>
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
              placeholder="Search appointments..."
              className="bg-transparent text-xs text-gray-600 outline-none w-44 placeholder:text-gray-400"
            />
            {search && (
              <button
                onClick={() => handleSearch("")}
                className="text-gray-400 hover:text-gray-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Table content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-sm text-gray-400">
            Loading appointments...
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center py-16 text-sm text-red-400">
            Failed to load appointments.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {[
                  "Patient",
                  "Doctor",
                  "Date",
                  "Time",
                  "Token",
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
              {appointments.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
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
                  const isActioning = loadingId === appt._id;

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
                        <div className="flex items-center gap-3">
                          <div
                            className={clsx(
                              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                              AVATAR_COLORS[idx % AVATAR_COLORS.length],
                            )}
                          >
                            {getInitials(
                              appt.patientName || appt.patientId?.name || "",
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {appt.patientName || appt.patientId?.name || "—"}
                            </p>
                            <p className="text-xs text-gray-400">
                              Age: {appt.patientAge ?? "—"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Doctor */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={clsx(
                              "w-1.5 h-1.5 rounded-full shrink-0",
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
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-medium text-gray-800">
                          {fmt(appt.date)}
                        </p>
                      </td>

                      {/* Time */}
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700">
                          {fmtTime(appt.time)}
                        </span>
                      </td>

                      {/* Token */}
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">
                          #{appt.tokenNumber ?? "—"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
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
                      <td className="px-5 py-3.5">
                        <ActionMenu
                          appt={appt}
                          onComplete={completeMutate}
                          onCancel={cancelMutate}
                          loadingId={loadingId}
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
        {!isLoading && !isError && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">
              Showing{" "}
              {total === 0 ? 0 : Math.min((page - 1) * limit + 1, total)}–
              {Math.min(page * limit, total)} of {total.toLocaleString()}{" "}
              appointments
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
