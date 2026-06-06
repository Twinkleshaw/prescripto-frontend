import { useNavigate } from "react-router-dom";
import {
  UserRound,
  CalendarDays,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import clsx from "clsx";
import { useQuery } from "@tanstack/react-query";

import { useAuthStore } from "../../store/authStore";

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
  "bg-teal-100 text-teal-700",
  "bg-amber-100 text-amber-700",
  "bg-violet-100 text-violet-600",
  "bg-blue-100 text-blue-600",
  "bg-pink-100 text-pink-600",
];

const APPT_STATUS = {
  completed: { label: "COMPLETED", cls: "bg-[#0068601A] text-[#006860]" },
  booked: { label: "PENDING", cls: "bg-amber-50 text-amber-600" },
  cancelled: { label: "CANCELLED", cls: "bg-[#FFDAD6] text-[#93000A]" },
};

const PAY_STATUS = {
  paid: { label: "Paid", cls: "bg-[#DCFCE7] text-[#15803D]" },
  pending: { label: "Pending", cls: "bg-[#FEF3C7] text-[#B45309]" },
};

// ── Skeleton ──────────────────────────────────────────────
function Skeleton({ className }) {
  return (
    <div className={clsx("animate-pulse bg-gray-100 rounded-xl", className)} />
  );
}

// ── Horizontal Bar Chart ──────────────────────────────────
const DAY_DATA = [
  { day: "MON", value: 40 },
  { day: "TUE", value: 65 },
  { day: "WED", value: 95 },
  { day: "THU", value: 55 },
  { day: "FRI", value: 70 },
  { day: "SAT", value: 30 },
  { day: "SUN", value: 20 },
];

function VerticalBarChart({ data = [] }) {
  const maxValue = Math.max(...data.map((item) => item.count), 1);

  const today = new Date()
    .toLocaleDateString("en-US", {
      weekday: "short",
    })
    .slice(0, 3);

  return (
    <div className="h-72 flex items-end justify-between gap-3 mt-6">
      {data.map((item) => {
        const height = (item.count / maxValue) * 180;

        const isToday = item.day.toLowerCase() === today.toLowerCase();

        return (
          <div key={item.day} className="flex flex-col items-center flex-1">
            {/* <div className="text-xs font-semibold text-gray-500 mb-2">
              {item.count}
            </div> */}

            <div
              className={`w-full rounded-t-md transition-all duration-500 ${
                isToday ? "bg-[#006860]" : "bg-gray-200"
              }`}
              style={{
                height: `${Math.max(height, 20)}px`,
              }}
            />

            <div
              className={`mt-3 text-xs font-bold ${
                isToday ? "text-[#006860]" : "text-gray-400"
              }`}
            >
              {item.day.toUpperCase()}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Upcoming Patient Row ──────────────────────────────────
function UpcomingRow({ patientName, date, time, color }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <div
        className={clsx(
          "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
          color,
        )}
      >
        {getInitials(patientName)}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {patientName}
        </p>

        <p className="text-[10px] text-gray-400">
          {fmtDate(date)} · {fmtTime(time)}
        </p>
      </div>

      <ChevronRight size={14} className="text-gray-300 shrink-0" />
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────
export default function DoctorDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const firstName = user?.name;

  const { data, isLoading } = useQuery({
    queryKey: ["doctorDashboard"],
    queryFn: getDoctorDashboardApi,
  });

  const d = data?.data;

  return (
    <div className=" max-w-7xl mx-auto">
      {/* ── Header ── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Clinic Overview</h1>
        <p className="text-sm text-gray-400 mt-1">
          Welcome back, {firstName}. Here is what's happening today.
        </p>
      </div>

      {/* ── Top Row: Revenue Card + 4 Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
        {/* Revenue Hero Card */}
        <div className="bg-[#006860] rounded-2xl p-5 flex flex-col justify-between max-h-[150px] relative overflow-hidden">
          {/* decorative circle */}
          <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10" />
          <div className="absolute -right-2 top-10 w-16 h-16 rounded-full bg-white/10" />

          <div>
            <p className="text-[11px] font-semibold text-white/70 uppercase tracking-wider mb-1">
              Total Transaction Volume
            </p>
            {isLoading ? (
              <Skeleton className="h-9 w-36 bg-white/20 mt-1" />
            ) : (
              <p className="text-3xl font-bold text-white">
                {fmtMoney(d?.totalEarnings ?? 0)}
              </p>
            )}
            {/* <div className="flex items-center gap-1 mt-2">
              <TrendingUp size={12} className="text-emerald-300" />
              <span className="text-[10px] font-semibold text-emerald-300">
                +12.5% from last month
              </span>
            </div> */}
          </div>
          {/* <button
            onClick={() => navigate("/doctor/earnings")}
            className="mt-4 self-start bg-white/20 hover:bg-white/30 transition-colors text-white text-xs font-semibold px-4 py-2 rounded-xl"
          >
            View Revenue Details
          </button> */}
        </div>

        {/* Right 4 mini-cards */}
        <div className="sm:col-span-1 lg:col-span-2 grid grid-cols-2 gap-4">
          {/* Appointments */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                <CalendarDays size={15} className="text-blue-500" />
              </div>
              <span className="text-[9px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wide">
                Weekly
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
              Appointments
            </p>
            {isLoading ? (
              <Skeleton className="h-7 w-16 mt-1" />
            ) : (
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {(d?.weeklyAppointments ?? 0).toLocaleString()}
              </p>
            )}
          </div>

          {/* Completed Today */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center">
                <CheckCircle2 size={15} className="text-[#006860]" />
              </div>
              <span className="text-[9px] font-bold text-[#006860] bg-teal-50 px-2 py-0.5 rounded-full uppercase tracking-wide">
                Daily
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
              Completed Today
            </p>
            {isLoading ? (
              <Skeleton className="h-7 w-12 mt-1" />
            ) : (
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {d?.todayCompletedAppointments ?? 0}
              </p>
            )}
          </div>

          {/* Pending Approvals */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                <Clock size={15} className="text-amber-500" />
              </div>
              <span className="text-[9px] font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-wide">
                Pending
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
              Pending Approvals
            </p>
            {isLoading ? (
              <Skeleton className="h-7 w-12 mt-1" />
            ) : (
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {d?.pendingAppointments ?? 0}
              </p>
            )}
          </div>

          {/* New Patients */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center">
                <UserRound size={15} className="text-purple-500" />
              </div>
              <span className="text-[9px] font-bold text-purple-500 bg-purple-50 px-2 py-0.5 rounded-full uppercase tracking-wide">
                Total
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
              New Patients
            </p>
            {isLoading ? (
              <Skeleton className="h-7 w-12 mt-1" />
            ) : (
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {(d?.newPatientsToday ?? 0).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom Row: Chart + Upcoming ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        {/* Patient Visit Analytics */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-gray-900">
                Patient Visit Analytics
              </h2>
              <p className="text-[10px] text-gray-400 mt-0.5">
                Daily visit volume trends for the current week
              </p>
            </div>
            <div className="flex gap-1.5">
              {["Daily"].map((tab, i) => (
                <button
                  key={tab}
                  className={clsx(
                    "text-[10px] font-semibold px-3 py-1.5 rounded-lg transition-colors",
                    i === 0
                      ? "bg-[#006860] text-white"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200",
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <VerticalBarChart data={d?.weeklyAnalytics || []} />
        </div>

        {/* Upcoming */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-900">Latest Bookings</h2>
            <button
              onClick={() => navigate("/doctor/appointments")}
              className="text-[10px] font-semibold text-[#006860] hover:underline"
            >
              See All
            </button>
          </div>
          <div>
            {d?.latestBookings.map((appt, index) => (
              <UpcomingRow
                key={appt._id}
                patientName={appt.patientName}
                date={appt.date}
                time={appt.time}
                color={AVATAR_COLORS[index % AVATAR_COLORS.length]}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
