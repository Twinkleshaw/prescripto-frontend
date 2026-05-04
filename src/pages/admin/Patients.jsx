import { useState } from "react";
import {
  UserPlus,
  MessageSquare,
  FileText,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import clsx from "clsx";
import { usePatients } from "../../hooks/usePatients";
import { getPatientByIdApi } from "../../api/endpoints/patient";

const STATUS_STYLES = {
  COMPLETED: "bg-teal-50 text-primary border border-teal-200",
  IN_PROGRESS: "bg-amber-50 text-amber-600 border border-amber-200",
  CANCELLED: "bg-red-50 text-red-500 border border-red-200",
  SCHEDULED: "bg-blue-50 text-blue-500 border border-blue-200",
};

const STATUS_LABELS = {
  COMPLETED: "Completed",
  IN_PROGRESS: "In Progress",
  CANCELLED: "Cancelled",
  SCHEDULED: "Scheduled",
};

const BAR_DATA = [
  { day: "MON", h: "h-12", active: false },
  { day: "TUE", h: "h-16", active: false },
  { day: "WED", h: "h-20", active: false },
  { day: "THU", h: "h-24", active: false },
  { day: "FRI", h: "h-28", active: true },
  { day: "SAT", h: "h-20", active: true },
  { day: "SUN", h: "h-10", active: false },
];

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
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Placeholder selected patient panel — wire to real data when API has detail endpoint
const SELECTED_PATIENT = {
  name: "Eleanor Herbert",
  patientId: "#PAT-2023-991",
  age: 34,
  gender: "Female",
  tags: ["Chronic Care", "Blood Group O+"],
  totalAppointments: 24,
  monthlyCount: 3,
  diagnosis: "Type 2 Diabetes, Hypertension Management",
  nextAppointment: {
    date: "Nov 12",
    title: "General Checkup",
    doctor: "Dr. Sarah Vane • Cardiology",
  },
  medications: ["Metformin - 500mg (Daily)", "Lisinopril - 10mg (Evening)"],
};

export default function AdminPatients() {
  const {
    patients,
    total,
    page,
    setPage,
    search,
    handleSearch,
    loading,
    error,
    totalPages,
  } = usePatients();

  const [selected, setSelected] = useState(null);

  // Use real selected patient or fallback to mock for UI demo
  const panel = selected;

  const handleSelectPatient = async (p) => {
    try {
      const res = await getPatientByIdApi(p._id);
      setSelected(res.data.patient);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex gap-5 h-full">
      {/* ── LEFT PANEL ── */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">All Patients</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Managing {total.toLocaleString()} active records
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-xl transition-colors">
            <UserPlus size={15} />
            New Patient
          </button>
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
            placeholder="Search by invoice ID or patient name"
            className="bg-transparent text-xs text-gray-600 outline-none w-full placeholder:text-gray-400"
          />
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-5">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-sm text-gray-400">
              Loading patients...
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
                    "Phone Number",
                    "Date",
                    // "Doctor",
                    // "Status",
                    "Action",
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
                  patients.map((p) => (
                    <tr
                      key={p._id}
                      onClick={() => handleSelectPatient(p)}
                      className={clsx(
                        "hover:bg-teal-50/40 cursor-pointer transition-colors",
                        selected?._id === p._id && "bg-teal-50/60",
                      )}
                    >
                      {/* Name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-teal-100 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                            {getInitials(p.name)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {p.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {p.age ? `Age: ${p.age}` : ""}
                              {p.gender ? ` • ${p.gender}` : ""}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-xs font-mono text-gray-500">
                        {p?.phone || "—"}
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {formatDate(p.createdAt)}
                      </td>

                      {/* Doctor */}
                      {/* <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[9px] font-bold text-gray-500 shrink-0">
                            {getInitials(p.doctorName || "Dr")}
                          </div>
                          <span className="text-xs text-gray-600">
                            {p.doctorName || "—"}
                          </span>
                        </div>
                      </td> */}

                      {/* Status */}
                      {/* <td className="px-4 py-3">
                        {p.status ? (
                          <span
                            className={clsx(
                              "text-[10px] font-bold px-2.5 py-1 rounded-full",
                              STATUS_STYLES[p.status] ||
                                "bg-gray-100 text-gray-500",
                            )}
                          >
                            {STATUS_LABELS[p.status] || p.status}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td> */}
                      <td className="px-4 py-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // 🚨 important (prevents row click)
                            handleSelectPatient(p);
                          }}
                          className="text-xs text-primary font-semibold hover:underline"
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
          {!loading && !error && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <span className="text-xs text-gray-400">
                Showing {Math.min((page - 1) * 10 + 1, total)}–
                {Math.min(page * 10, total)} of {total} patients
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

        {/* Patient Flow Trend chart */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-4">
            Patient Flow Trend
          </p>
          <div className="flex items-end gap-2 h-28">
            {BAR_DATA.map(({ day, h, active }) => (
              <div
                key={day}
                className="flex flex-col items-center gap-1.5 flex-1"
              >
                <div
                  className={clsx(
                    "w-full rounded-t-lg transition-all",
                    h,
                    active ? "bg-primary" : "bg-teal-100",
                  )}
                />
                <span
                  className={clsx(
                    "text-[9px] uppercase font-semibold",
                    active ? "text-primary" : "text-gray-400",
                  )}
                >
                  {day}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL — Patient Detail ── */}
      {!panel ? (
        <div className="text-sm text-gray-400 text-center mt-10"></div>
      ) : (
        <div className="w-64 shrink-0 flex flex-col gap-3">
          {/* Avatar + name */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-teal-100 flex items-center justify-center text-xl font-bold text-primary mb-3">
              {getInitials(panel.name || "")}
            </div>
            <p className="text-sm font-bold text-gray-900">{panel.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {panel.patientId || panel._id || "—"}
            </p>
            <div className="flex flex-wrap gap-1.5 justify-center mt-2">
              {(panel.tags || [panel.gender].filter(Boolean)).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-semibold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white border border-gray-200 rounded-xl p-3">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Total Appts
              </p>
              <p className="text-xl font-bold text-gray-900">
                {panel.totalAppointments ?? "—"}
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-3">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Monthly
              </p>
              <p className="text-xl font-bold text-gray-900">
                {String(panel.monthlyCount ?? "—").padStart(2, "0")}
              </p>
            </div>
          </div>

          {/* Diagnosis */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <p className="text-[9px] font-bold text-primary uppercase tracking-widest mb-1.5">
              Active Diagnosis
            </p>
            <p className="text-xs font-medium text-gray-700 leading-snug">
              {panel.diagnosis || "No active diagnosis"}
            </p>
          </div>

          {/* Next Appointment */}
          {panel.nextAppointment && (
            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                Next Appointment
              </p>
              <div className="flex gap-2">
                <div className="bg-primary rounded-lg px-2 py-1 text-center shrink-0">
                  <p className="text-[8px] text-teal-200 uppercase font-bold">
                    {panel.nextAppointment.date?.split(" ")[0]}
                  </p>
                  <p className="text-sm font-bold text-white">
                    {panel.nextAppointment.date?.split(" ")[1]}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800 leading-tight">
                    {panel.nextAppointment.title}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {panel.nextAppointment.doctor}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              Quick Actions
            </p>
            <div className="flex gap-2 mb-2">
              <button className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <MessageSquare size={12} /> Message
              </button>
              <button className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <FileText size={12} /> Report
              </button>
            </div>
            <button className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl transition-colors">
              <ClipboardList size={13} /> View Full Medical History
            </button>
          </div>

          {/* Medication Routine */}
          <div className="bg-primary rounded-2xl p-4">
            <div className="flex items-center justify-between mb-1">
              <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                  <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-7 14H8v-2h4v2zm4-4H8v-2h8v2zm0-4H8V7h8v2z" />
                </svg>
              </div>
              <span className="text-[9px] font-bold text-teal-200 bg-teal-700 px-2 py-0.5 rounded-full tracking-widest">
                CURRENT PLAN
              </span>
            </div>
            <p className="text-sm font-bold text-white mt-2 mb-0.5">
              Medication Routine
            </p>
            <p className="text-[10px] text-teal-300 mb-3">
              Updated 2 days ago by Head Nurse
            </p>
            <ul className="space-y-1.5">
              {(panel.medications || ["No medications listed"]).map((med) => (
                <li
                  key={med}
                  className="flex items-center gap-1.5 text-[11px] text-white"
                >
                  <span className="w-1 h-1 rounded-full bg-teal-300 shrink-0" />
                  {med}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
