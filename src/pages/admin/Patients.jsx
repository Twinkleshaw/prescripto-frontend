import { useState } from "react";
import { ChevronLeft, ChevronRight, Phone, Calendar, User } from "lucide-react";
import clsx from "clsx";
import { useQuery } from "@tanstack/react-query";
import { getUserByBookedByApi } from "../../api/endpoints/patient";
import { getPatientsSummary } from "../../api/endpoints/appointments";

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

const STATUS_MAP = {
  completed: "bg-[#DCFCE7] text-[#15803D] border-[#DCFCE7]",

  booked: "bg-[#FEF3C7] text-[#B45309] border-[#FEF3C7]",

  cancelled: "bg-[#FEE2E2] text-[#B91C1C] border-[#FEE2E2]",
};

const AVATAR_COLORS = ["bg-[#F1F5F9] text-[#006860]"];

export default function AdminPatients() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const limit = 10;

  console.log(selected);

  // ── Fetch patient list ────────────────────────────────
  const { data, isLoading, isError } = useQuery({
    queryKey: ["patients", page, search],
    queryFn: () => getPatientsSummary({ page, limit, search }),
    keepPreviousData: true,
  });

  const patients = data?.data?.patients ?? [];
  const total = data?.data?.totalPatients ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  // ── Select patient — fetch detail ─────────────────────
  const handleSelect = async (p) => {
    if (selected?.user?._id === p?.bookedBy) {
      setSelected(null);
      return;
    }

    setLoadingDetail(true);

    try {
      const res = await getUserByBookedByApi(p.bookedBy, {
        page: 1,
        limit: 10,
        search: "",
      });

      setSelected({
        ...res.data,
        clickedPatient: p,
      });
    } catch (error) {
      console.error(error);
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
              Managing {total.toLocaleString()} active records
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
                <tr className="bg-[#F2F4F6] ">
                  {[
                    "Patient Name",
                    "Invoice Id",
                    "Date",
                    "Doctor",
                    "Status",
                    "Action",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left text-[11px] font-semibold text-[#64748B] uppercase tracking-wider px-4 py-3"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 ">
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
                              "w-10 h-10 rounded-full flex items-center justify-center text-[16px] font-bold shrink-0",
                              AVATAR_COLORS[idx % AVATAR_COLORS.length],
                            )}
                          >
                            {getInitials(p?.patientName || "")}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#475569]">
                              {p?.patientName || "—"}
                            </p>
                            <p className="text-xs text-gray-400">
                              {p?.patientAge ? `Age ${p.patientAge}` : ""}
                              {p?.patientAge && p?.patientGender ? " · " : ""}
                              {p?.patientGender || ""}
                            </p>
                          </div>
                        </div>
                      </td>
                      {/* Invoice */}
                      <td className="px-4 py-3 text-xs text-[#475569] font-mono"></td>

                      {/* date */}
                      <td className="px-4 py-3 text-[14px]  text-[#475569]">
                        {formatDate(p?.latestAppointmentCreatedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-semibold text-gray-500 shrink-0">
                            {getInitials(p?.doctor?.name || "")}
                          </div>
                          <span className=" text-[14px] text-[#475569]">
                            {p?.doctor?.name || "—"}
                          </span>
                        </div>
                      </td>
                      {/* Status */}
                      <td className="px-4 py-3">
                        <span
                          className={clsx(
                            "text-[11px] font-medium px-2.5 py-0.5 rounded-full capitalize",
                            STATUS_MAP[p?.latestStatus] ||
                              "bg-gray-100 text-gray-600",
                          )}
                        >
                          {p?.latestStatus?.replace("_", " ") || "—"}
                        </span>
                      </td>
                      {/* view */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleSelect(p)}
                          className="text-primary text-sm font-medium hover:underline"
                        >
                          View
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
      <div className="w-[300px] shrink-0">
        {!selected && !loadingDetail ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-6 flex flex-col items-center justify-center text-center h-72">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
              <User size={22} className="text-gray-400" />
            </div>

            <p className="text-sm font-semibold text-gray-600">
              No patient selected
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Click View to see details
            </p>
          </div>
        ) : loadingDetail ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-6 flex items-center justify-center h-72">
            <p className="text-sm text-gray-400">Loading...</p>
          </div>
        ) : (
          <div className="bg-[#F8FAFC] border border-gray-200 rounded-3xl p-5 relative overflow-hidden">
            {/* Decorative */}
            <div className="absolute top-0 right-0 w-28 h-28 bg-[#EEF2F7] rounded-full translate-x-10 -translate-y-10" />

            {/* Avatar */}
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="w-24 h-24 rounded-3xl bg-[#E2F5F2] flex items-center justify-center text-3xl font-bold text-primary border-[6px] border-white shadow-sm">
                {getInitials(
                  selected?.user?.name || selected?.user?.phone || "",
                )}
              </div>

              {/* Patient Name */}
              <h2 className="mt-4 text-[30px] leading-none font-bold text-[#1E293B]">
                {selected?.user?.name || "Unknown"}
              </h2>

              {/* User / Account */}
              <p className="text-sm text-[#64748B] mt-2">
                Booked By:{" "}
                <span className="font-semibold text-[#334155]">
                  {selected?.user?.phone || "—"}
                </span>
              </p>

              {/* Chips */}
              {/* <div className="flex items-center gap-2 mt-4 flex-wrap justify-center">
                <span className="px-3 py-1 rounded-full bg-[#E2E8F0] text-[#475569] text-xs font-semibold">
                  Age {selected?.clickedPatient?.patientAge || "—"}
                </span>

                <span className="px-3 py-1 rounded-full bg-[#E2E8F0] text-[#475569] text-xs font-semibold">
                  {selected?.totalFamilyMembers || 0} Family Members
                </span>
              </div> */}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="bg-[#F1F5F9] rounded-2xl p-4">
                <p className="text-[10px] uppercase tracking-widest text-[#94A3B8] font-bold">
                  Total Appointments
                </p>

                <h3 className="mt-2 text-3xl font-bold text-primary">
                  {selected?.totalAppointments || 0}
                </h3>
              </div>

              <div className="bg-[#F1F5F9] rounded-2xl p-4">
                <p className="text-[10px] uppercase tracking-widest text-[#94A3B8] font-bold">
                  Monthly Count
                </p>

                <h3 className="mt-2 text-3xl font-bold text-primary">
                  {selected?.recentAppointments?.length || 0}
                </h3>
              </div>
            </div>

            {/*  Patients */}
            <div className="mt-7">
              <p className="text-[10px] uppercase tracking-widest text-[#94A3B8] font-bold mb-3">
                Patients
              </p>

              <div className="space-y-2">
                {selected?.familyPatients?.map((patient, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-gray-100 rounded-2xl px-4 py-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#1E293B]">
                        {patient.patientName}
                      </p>

                      <p className="text-xs text-[#64748B] mt-0.5">
                        Age {patient.patientAge}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">
                        {patient.totalVisits}
                      </p>

                      <p className="text-[10px] uppercase text-[#94A3B8]">
                        Visits
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Appointment */}
            {selected?.recentAppointments?.[0] && (
              <div className="mt-7">
                <p className="text-[10px] uppercase tracking-widest text-[#94A3B8] font-bold mb-3">
                  Appointment
                </p>

                <div className="bg-[#EEF2F2] rounded-2xl p-4 border-l-4 border-primary">
                  <div className="flex items-start gap-3">
                    <div className="bg-white rounded-xl px-3 py-2 text-center shadow-sm">
                      <p className="text-[10px] font-bold text-red-500 uppercase">
                        {new Date(
                          selected.recentAppointments[0].createdAt,
                        ).toLocaleDateString("en-US", {
                          month: "short",
                        })}
                      </p>

                      <p className="text-xl font-bold text-[#0F172A]">
                        {new Date(
                          selected.recentAppointments[0].createdAt,
                        ).getDate()}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-bold text-[#1E293B]">
                        General Checkup
                      </p>

                      <p className="text-xs text-[#64748B] mt-1">
                        {selected?.recentAppointments?.[0]?.doctorId?.name} •{" "}
                        {
                          selected?.recentAppointments?.[0]?.doctorId
                            ?.speciality
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Close */}
            <button
              onClick={() => setSelected(null)}
              className="w-full mt-6 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-semibold text-[#475569] hover:bg-gray-50 transition-colors"
            >
              Close Panel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
