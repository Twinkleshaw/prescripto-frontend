import { useState } from "react";
import { ChevronLeft, ChevronRight, Phone, Calendar, User } from "lucide-react";
import clsx from "clsx";
import { useQuery } from "@tanstack/react-query";
import { getPatientByIdApi, getPatientsApi } from "../../api/endpoints/patient";

// ── helpers ──────────────────────────────────────────────
function getInitials(name = "") {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const AVATAR_COLORS = [
  "bg-teal-100 text-primary",
  "bg-amber-100 text-amber-700",
  "bg-violet-100 text-violet-600",
  "bg-blue-100 text-blue-600",
  "bg-pink-100 text-pink-600",
];

export default function AdminPatients() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const limit = 10;

  // ── Fetch patient list ────────────────────────────────
  const { data, isLoading, isError } = useQuery({
    queryKey: ["patients", page, search],
    queryFn: () => getPatientsApi({ page, limit, search }),
    keepPreviousData: true,
  });

  const patients = data?.data?.patients ?? [];
  const total = data?.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  // ── Select patient — fetch detail ─────────────────────
  const handleSelect = async (p) => {
    if (selected?._id === p._id) {
      setSelected(null);
      return;
    }
    setLoadingDetail(true);
    try {
      const res = await getPatientByIdApi(p._id);
      setSelected(res.data.patient);
    } catch {
      // fallback to list data if detail fetch fails
      setSelected(p);
    } finally {
      setLoadingDetail(false);
    }
  };

  // ── Search with debounce reset to page 1 ─────────────
  const handleSearch = (val) => {
    setSearch(val);
    setPage(1);
    setSelected(null);
  };

  return (
    <div className="flex gap-5 min-h-0">
      {/* ── LEFT — Patient list ── */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">All Patients</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {total.toLocaleString()} total records
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5 mb-4 w-full max-w-sm">
          <svg
            className="w-3.5 h-3.5 stroke-gray-400 fill-none shrink-0"
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
            placeholder="Search by name or phone"
            className="bg-transparent text-xs text-gray-600 outline-none w-full placeholder:text-gray-400"
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

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-sm text-gray-400">
              Loading patients...
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center py-16 text-sm text-red-400">
              Failed to load patients.
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Patient Name", "Phone", "Gender", "Joined", "Action"].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {patients.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-12 text-sm text-gray-400"
                    >
                      No patients found.
                    </td>
                  </tr>
                ) : (
                  patients.map((p, idx) => (
                    <tr
                      key={p._id}
                      className={clsx(
                        "hover:bg-teal-50/40 cursor-pointer transition-colors",
                        selected?._id === p._id && "bg-teal-50/60",
                      )}
                    >
                      {/* Name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={clsx(
                              "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                              AVATAR_COLORS[idx % AVATAR_COLORS.length],
                            )}
                          >
                            {getInitials(p.name || p.phone)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {p.name || "—"}
                            </p>
                            <p className="text-xs text-gray-400 font-mono">
                              #{p._id.slice(-6).toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="px-4 py-3 text-xs text-gray-600 font-mono">
                        {p.phone || "—"}
                      </td>

                      {/* Gender */}
                      <td className="px-4 py-3">
                        {p.gender ? (
                          <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                            {p.gender}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>

                      {/* Joined date */}
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {formatDate(p.createdAt)}
                      </td>

                      {/* View button */}
                      <td className="px-4 py-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelect(p);
                          }}
                          className={clsx(
                            "text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors",
                            selected?._id === p._id
                              ? "bg-primary text-white"
                              : "text-primary bg-teal-50 hover:bg-teal-100",
                          )}
                        >
                          {selected?._id === p._id ? "Viewing" : "View"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {!isLoading && !isError && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <span className="text-xs text-gray-400">
                Showing{" "}
                {total === 0 ? 0 : Math.min((page - 1) * limit + 1, total)}–
                {Math.min(page * limit, total)} of {total} patients
              </span>
              <div className="flex gap-1">
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

      {/* ── RIGHT — Patient Detail Panel ── */}
      <div className="w-64 shrink-0">
        {!selected && !loadingDetail ? (
          // Empty state
          <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center h-64">
            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
              <User size={20} className="text-gray-400" />
            </div>
            <p className="text-sm font-semibold text-gray-500">
              No patient selected
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Click View on any row to see details
            </p>
          </div>
        ) : loadingDetail ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 flex items-center justify-center h-64">
            <p className="text-sm text-gray-400">Loading...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Avatar + basic info */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-teal-100 flex items-center justify-center text-xl font-bold text-primary mb-3">
                {getInitials(selected.name || selected.phone || "")}
              </div>
              <p className="text-sm font-bold text-gray-900">
                {selected.name || "Unnamed Patient"}
              </p>
              <p className="text-xs font-mono text-gray-400 mt-0.5">
                #{selected._id.slice(-8).toUpperCase()}
              </p>
              {selected.gender && (
                <span className="text-[10px] font-semibold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full mt-2">
                  {selected.gender}
                </span>
              )}
            </div>

            {/* Details */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
              <p className="text-[9px] font-bold text-primary uppercase tracking-widest mb-2">
                Patient Details
              </p>

              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-teal-50 rounded-lg flex items-center justify-center shrink-0">
                  <Phone size={12} className="text-primary" />
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 uppercase font-semibold">
                    Phone
                  </p>
                  <p className="text-xs font-semibold text-gray-800 mt-0.5">
                    {selected.phone || "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-teal-50 rounded-lg flex items-center justify-center shrink-0">
                  <Calendar size={12} className="text-primary" />
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 uppercase font-semibold">
                    Registered
                  </p>
                  <p className="text-xs font-semibold text-gray-800 mt-0.5">
                    {formatDate(selected.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-teal-50 rounded-lg flex items-center justify-center shrink-0">
                  <User size={12} className="text-primary" />
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 uppercase font-semibold">
                    Account Status
                  </p>
                  <span
                    className={clsx(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 inline-block",
                      selected.isActive
                        ? "bg-teal-50 text-primary"
                        : "bg-red-50 text-red-500",
                    )}
                  >
                    {selected.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            {/* Last updated */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                Last Updated
              </p>
              <p className="text-xs font-semibold text-gray-700">
                {formatDate(selected.updatedAt)}
              </p>
            </div>

            {/* Close detail */}
            <button
              onClick={() => setSelected(null)}
              className="w-full py-2 text-xs font-semibold text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Close Panel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
