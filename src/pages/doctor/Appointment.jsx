import { useState, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Clock,
  CheckCheck,
} from "lucide-react";
import clsx from "clsx";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAppointmentsApi,
  cancelAppointmentApi,
  completeAppointmentApi,
} from "../../api/endpoints/appointments";

// ── helpers ──────────────────────────────────────────────
function getInitials(name = "") {
  return (
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
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

const AVATAR_COLORS = [
  "bg-teal-100 text-primary",
  "bg-amber-100 text-amber-700",
  "bg-violet-100 text-violet-600",
  "bg-blue-100 text-blue-600",
  "bg-pink-100 text-pink-600",
];

const APPT_STATUS = {
  completed: {
    label: "COMPLETED",
    cls: "bg-[#0068601A] text-[#006860]",
  },
  booked: {
    label: "PENDING",
    cls: "bg-amber-50 text-amber-600",
  },
  cancelled: {
    label: "CANCELLED",
    cls: "bg-[#FFDAD6] text-[#93000A]",
  },
};

const PAY_STATUS = {
  paid: { label: "Paid", cls: "bg-[#DCFCE7] text-[#15803D]" },
  pending: { label: "Pending", cls: "bg-[#FEF3C7] text-[#B45309]" },
};

const PAY_TYPE = {
  pay_at_clinic: "Cash",
  online: "Online",
  stripe: "Stripe",
  razorpay: "Razorpay",
};

// Filter tabs config
const FILTER_TABS = [
  { key: "all", label: "All" },
  { key: "booked", label: "Pending" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

// Debounce hook
function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ── Main Page ─────────────────────────────────────────────
export default function DoctorAppointments() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearch] = useState("");
  const [activeFilter, setFilter] = useState("all");
  const [actioningId, setActioningId] = useState(null);
  const debouncedSearch = useDebounce(searchInput);
  const queryClient = useQueryClient();
  const limit = 10;

  // Reset page when filter or search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, activeFilter]);

  // ── Fetch ─────────────────────────────────────────────
  const { data, isLoading, isError } = useQuery({
    queryKey: ["doctorAppointments", page, debouncedSearch, activeFilter],
    queryFn: () =>
      getAppointmentsApi({
        page,
        limit,
        search: debouncedSearch || undefined,
        status: activeFilter === "all" ? undefined : activeFilter,
      }),
    keepPreviousData: true,
  });

  const appointments = data?.data?.appointments ?? [];
  const total = data?.data?.totalAppointments ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  // Stat counts from current page (full counts need backend — this is approximate)
  const pendingCount = appointments.filter((a) => a.status === "booked").length;
  const completedCount = appointments.filter(
    (a) => a.status === "completed",
  ).length;

  // ── Cancel ────────────────────────────────────────────
  const { mutate: cancelMutate } = useMutation({
    mutationFn: cancelAppointmentApi,
    onMutate: (id) => setActioningId(id),
    onSettled: () => setActioningId(null),
    onSuccess: () => queryClient.invalidateQueries(["doctorAppointments"]),
    onError: (err) =>
      alert(err?.response?.data?.message || "Failed to cancel."),
  });

  // ── Complete ──────────────────────────────────────────
  const { mutate: completeMutate } = useMutation({
    mutationFn: completeAppointmentApi,
    onMutate: (id) => setActioningId(id),
    onSettled: () => setActioningId(null),
    onSuccess: () => queryClient.invalidateQueries(["doctorAppointments"]),
    onError: (err) =>
      alert(err?.response?.data?.message || "Failed to complete."),
  });

  return (
    <div>
      {/* ── Header ── */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">
          Appointment Management
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          View and manage your patient appointments
        </p>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center mb-3">
            <CalendarDays size={17} className="text-primary" />
          </div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Total Appointments
          </p>
          <p className="text-2xl font-bold text-gray-900">{total}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center mb-3">
            <Clock size={17} className="text-amber-500" />
          </div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Pending
          </p>
          <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
          <p className="text-xs text-gray-400 mt-0.5">on this page</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center mb-3">
            <CheckCheck size={17} className="text-green-500" />
          </div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Completed
          </p>
          <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
          <p className="text-xs text-gray-400 mt-0.5">on this page</p>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          {/* Filter tabs */}
          <div className="flex gap-1">
            {FILTER_TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={clsx(
                  "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors",
                  activeFilter === key
                    ? "bg-gray-900 text-white"
                    : "text-gray-500 hover:bg-gray-100",
                )}
              >
                {label}
              </button>
            ))}
          </div>

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
              value={searchInput}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patient name..."
              className="bg-transparent text-xs text-gray-600 outline-none w-40 placeholder:text-gray-400"
            />
            {searchInput && (
              <button
                onClick={() => setSearch("")}
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
                  "Date",
                  "Time",
                  "Specialization",
                  "Payment Status",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3"
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
                  const apptStatus = APPT_STATUS[appt.status] || {
                    label: appt.status,
                    cls: "bg-gray-100 text-gray-500",
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
                      {/* Patient details */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={clsx(
                              "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 capitalize",
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
                      <td className="px-4 py-3.5">
                        <p className="text-sm font-medium text-gray-800">
                          {fmtDate(appt.date)}
                        </p>
                      </td>

                      {/* Token */}
                      <td className="px-4 py-4 min-w-[90px]">
                        <div className="flex items-center gap-2 text-primary font-semibold whitespace-nowrap">
                          <Clock size={13} className="shrink-0" />
                          <span className="text-sm">{fmtTime(appt.time)}</span>
                        </div>
                      </td>

                      {/* Payment Mode */}
                      <td className="px-4 py-4 min-w-[170px]">
                        <span
                          className="
      inline-flex
      items-center
      justify-center
      whitespace-nowrap
      px-3
      py-1.5
      rounded-full
      text-xs
      font-semibold
      bg-gray-100
      text-gray-700
    "
                        >
                          {appt?.doctorId?.speciality || "General"}
                        </span>
                      </td>

                      {/* Payment Status */}
                      <td className="px-4 py-3.5">
                        <span
                          className={clsx(
                            "inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full",
                            payStatus.cls,
                          )}
                        >
                          <span className="w-1 h-1 rounded-full bg-current" />
                          {payStatus.label}
                        </span>
                      </td>

                      {/* Appointment Status */}
                      <td className="px-4 py-3.5">
                        <span
                          className={clsx(
                            "inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full",
                            apptStatus.cls,
                          )}
                        >
                          {apptStatus.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5">
                        <div className="flex gap-1.5">
                          {/* Mark Complete */}
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
                              size={13}
                              className={
                                isDone ? "text-gray-400" : "text-primary"
                              }
                            />
                          </button>

                          {/* Cancel */}
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
                              size={13}
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

        {/* Pagination */}
        {!isLoading && !isError && total > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)}{" "}
              of {total} appointments
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
