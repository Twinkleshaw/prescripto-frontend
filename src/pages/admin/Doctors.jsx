import { useState } from "react";
import {
  Plus,
  Download,
  SlidersHorizontal,
  CalendarDays,
  Trash2,
  Info,
} from "lucide-react";
import clsx from "clsx";
import { doctorList } from "../../api/endpoints/doctor";
import { useQuery } from "@tanstack/react-query";
import doctorImg from "../../assets/doctor.png";
const DOCTORS = [
  {
    id: 1,
    initials: "AV",
    color: "bg-teal-100 text-primary",
    name: "Dr. Alistair Vaughn",
    email: "vaughn.a@prescripto.com",
    specialization: "Cardiology",
    status: "Active",
    appointments: "1,204",
    earnings: "$142,500",
  },
  {
    id: 2,
    initials: "EM",
    color: "bg-amber-100 text-amber-700",
    name: "Dr. Elena Martinez",
    email: "martinez.e@prescripto.com",
    specialization: "Neurology",
    status: "Pause",
    appointments: "856",
    earnings: "$98,200",
  },
  {
    id: 3,
    initials: "LC",
    color: "bg-violet-100 text-violet-700",
    name: "Dr. Lilian Choi",
    email: "choi.l@prescripto.com",
    specialization: "Pediatrics",
    status: "Active",
    appointments: "2,110",
    earnings: "$215,900",
  },
];

const STATS = [
  {
    label: "Total Specialists",
    value: "142",
    badge: "+12%",
    badgeStyle: "bg-green-50 text-green-600",
  },
  {
    label: "Active Surgeons",
    value: "24",
    badge: "Capacity 88%",
    badgeStyle: "bg-gray-100 text-gray-500",
  },
  { label: "Average Rating", value: "4.92", stars: true },
  {
    label: "Monthly Revenue",
    value: "$842k",
    badge: "High",
    badgeStyle: "bg-teal-50 text-primary",
  },
];

const APPOINTMENTS = [
  { day: "Monday", count: 12 },
  { day: "Tuesday", count: 18 },
  { day: "Wednesday", count: 15 },
];

const BAR_WEEKS = [
  { label: "Week 1", height: "h-12", active: false },
  { label: "Week 2", height: "h-16", active: false },
  { label: "Week 3", height: "h-24", active: true },
  { label: "Week 4", height: "h-10", active: false },
];

export default function AdminDoctors() {
  const [page, setPage] = useState(1);
  const { data } = useQuery({
    queryKey: ["doctors"],
    queryFn: doctorList,
  });

  console.log(data?.data?.doctors);

  const doctors = data?.data?.doctors ?? [];

  return (
    <div>
      {/* Header */}
      <p className="text-xs font-bold text-primary tracking-widest uppercase mb-1">
        Management
      </p>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-gray-900">
          Practitioner Registry
        </h1>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Download size={13} /> Export CSV
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <SlidersHorizontal size={13} /> Filters
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors">
            <Plus size={13} /> Add Doctor
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 bg-white border border-gray-200 rounded-2xl overflow-hidden mb-5 divide-x divide-gray-100">
        {STATS.map(({ label, value, badge, badgeStyle, stars }) => (
          <div key={label} className="px-5 py-4">
            <p className="text-xs text-gray-400 font-medium mb-2">{label}</p>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-900">{value}</span>
              {badge && (
                <span
                  className={clsx(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full",
                    badgeStyle,
                  )}
                >
                  {badge}
                </span>
              )}
            </div>
            {stars && <p className="text-amber-400 text-sm mt-1">★★★★★</p>}
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-6">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {[
                "Doctor Name",
                "Specialization",
                "Status",
                "Appointments",
                "Earnings",
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
            {doctors.map((doc) => (
              <tr
                key={doc?._id}
                className="hover:bg-gray-50/60 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={clsx(
                        "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                        doc?.color,
                      )}
                    >
                      <img src={doc?.image ?? doctorImg} alt="" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {doc.name}
                      </p>
                      <p className="text-xs text-gray-400">{doc.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {doc?.specialty}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={clsx(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold",
                      doc?.status === "Active"
                        ? "bg-teal-50 text-primary"
                        : "bg-orange-50 text-orange-600",
                    )}
                  >
                    <span
                      className={clsx(
                        "w-1.5 h-1.5 rounded-full",
                        doc?.status === "Active"
                          ? "bg-primary"
                          : "bg-orange-400",
                      )}
                    />
                    {doc.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {doc?.appointments}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-800">
                  {doc?.earnings}
                </td>
                <td className="px-4 py-3">
                  <button className="text-xs font-semibold text-primary bg-teal-50 px-2.5 py-1 rounded-lg hover:bg-teal-100 transition-colors mb-1.5">
                    View Report
                  </button>
                  <div className="flex gap-1.5">
                    <button className="w-6 h-6 rounded-md border border-teal-200 bg-teal-50 flex items-center justify-center hover:bg-teal-100 transition-colors">
                      <Info size={11} className="text-primary" />
                    </button>
                    <button className="w-6 h-6 rounded-md border border-gray-200 bg-white flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-colors">
                      <Trash2
                        size={11}
                        className="text-gray-400 hover:text-red-400"
                      />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">
            Showing 1–10 of 142 practitioners
          </span>
          <div className="flex gap-1">
            <button className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50">
              <svg
                className="w-3.5 h-3.5 stroke-gray-400 fill-none"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            {[1, 2].map((n) => (
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
            <button className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50">
              <svg
                className="w-3.5 h-3.5 stroke-gray-400 fill-none"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Performance Report */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Doctor Performance Report
          </h2>
          <p className="text-xs text-gray-400">
            Deep-dive analysis for Dr. Alistair Vaughn (Current Month)
          </p>
        </div>
        <span className="text-xs text-gray-400">Oct 2023 – Nov 2023</span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {/* Payment Tracking */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-3">
            Payment Tracking
          </p>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl font-bold text-gray-900">$14,240</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-teal-300 bg-teal-50 text-primary">
              CLEARED
            </span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full mb-2">
            <div
              className="h-1.5 bg-primary rounded-full"
              style={{ width: "83%" }}
            />
          </div>
          <p className="text-xs text-gray-400">83% of monthly target reached</p>
        </div>

        {/* Due Payments */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-3">
            Due Payments
          </p>
          <div className="flex items-start justify-between">
            <span className="text-xl font-bold text-gray-900">$2,105</span>
            <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center">
              <svg
                className="w-3.5 h-3.5 stroke-orange-400 fill-none"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Pending from 12 medical claims
          </p>
        </div>

        {/* Today Earnings — teal card */}
        <div className="bg-primary rounded-2xl p-4">
          <p className="text-[10px] font-bold text-teal-200 tracking-widest uppercase mb-2">
            Today Earnings
          </p>
          <p className="text-2xl font-bold text-white mb-4">$1,840.00</p>
          <div className="flex gap-6">
            <div>
              <p className="text-[9px] text-teal-300 uppercase tracking-wider">
                Direct
              </p>
              <p className="text-sm font-semibold text-white mt-0.5">$1,200</p>
            </div>
            <div>
              <p className="text-[9px] text-teal-300 uppercase tracking-wider">
                Insurance
              </p>
              <p className="text-sm font-semibold text-white mt-0.5">$640</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Chart + Schedule */}
      <div className="grid grid-cols-2 gap-3">
        {/* Bar chart */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">
              Monthly Appointment Flow
            </p>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="w-2 h-2 rounded-full bg-primary inline-block" />
              Appointments
            </div>
          </div>
          <div className="flex items-end gap-3 h-24">
            {BAR_WEEKS.map(({ label, height, active }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1.5 flex-1"
              >
                <div
                  className={clsx(
                    "w-full rounded-t-lg",
                    height,
                    active ? "bg-primary" : "bg-teal-100",
                  )}
                />
                <span className="text-[9px] text-gray-400 uppercase">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Everyday appointments */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-3">
            Everyday Appointments
          </p>
          <div className="divide-y divide-gray-50">
            {APPOINTMENTS.map(({ day, count }) => (
              <div
                key={day}
                className="flex items-center justify-between py-2.5"
              >
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <CalendarDays size={14} className="text-primary" />
                  {day}
                </div>
                <span className="text-sm font-bold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
          <button className="w-full text-center text-xs font-bold text-primary tracking-widest mt-3 hover:underline">
            VIEW DETAILED SCHEDULE
          </button>
        </div>
      </div>
    </div>
  );
}
