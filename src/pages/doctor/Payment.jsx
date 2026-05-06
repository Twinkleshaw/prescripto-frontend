import clsx from "clsx";
import { useQuery } from "@tanstack/react-query";
import { getDoctorDashboardApi } from "../../api/endpoints/doctor";
import { CreditCard, Banknote, TrendingUp } from "lucide-react";

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

function fmtMoney(val) {
  if (val === undefined || val === null) return "—";
  return `₹${Number(val).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

const AVATAR_COLORS = [
  "bg-teal-100 text-primary",
  "bg-amber-100 text-amber-700",
  "bg-violet-100 text-violet-600",
  "bg-blue-100 text-blue-600",
  "bg-pink-100 text-pink-600",
];

const PAY_TYPE = {
  pay_at_clinic: "Cash",
  online: "Online",
  stripe: "Stripe",
  razorpay: "Razorpay",
};

const PAY_TYPE_STYLE = {
  pay_at_clinic: "bg-gray-100 text-gray-600",
  online: "bg-blue-50 text-blue-600",
  stripe: "bg-blue-50 text-blue-600",
  razorpay: "bg-blue-50 text-blue-600",
};

// ── Skeleton ──────────────────────────────────────────────
function Skeleton({ className }) {
  return (
    <div className={clsx("animate-pulse bg-gray-100 rounded-xl", className)} />
  );
}

// ── Main Page ─────────────────────────────────────────────
export default function DoctorPayment() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["doctorDashboard"],
    queryFn: getDoctorDashboardApi,
  });

  const d = data?.data;

  const online = d?.earnings?.online ?? 0;
  const offline = d?.earnings?.offline ?? 0;
  const total = online + offline || 1; // avoid divide by zero
  const onlinePct = Math.round((online / total) * 100);
  const offlinePct = Math.round((offline / total) * 100);

  // Payment history from latestBookings
  const bookings = d?.latestBookings ?? [];

  return (
    <div>
      {/* ── Header ── */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Earnings Overview</h1>
        <p className="text-sm text-gray-400 mt-1">
          Track your online payments, offline collections and completed earnings
        </p>
      </div>

      {/* ── Top stat row ── */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {/* Total earnings hero */}
        <div className="bg-primary rounded-2xl p-5">
          <p className="text-[10px] font-bold text-teal-300 tracking-widest uppercase mb-2">
            Total Earnings
          </p>
          {isLoading ? (
            <Skeleton className="h-8 w-28 mb-4 bg-teal-600" />
          ) : (
            <p className="text-3xl font-bold text-white mb-4">
              {fmtMoney(d?.totalEarnings)}
            </p>
          )}
          <div className="flex gap-6">
            <div>
              <p className="text-[9px] text-teal-300 uppercase tracking-wider font-bold">
                Today
              </p>
              <p className="text-sm font-semibold text-white mt-0.5">
                {isLoading ? "—" : fmtMoney(d?.todayEarnings)}
              </p>
            </div>
            <div>
              <p className="text-[9px] text-teal-300 uppercase tracking-wider font-bold">
                All Time
              </p>
              <p className="text-sm font-semibold text-white mt-0.5">
                {isLoading ? "—" : fmtMoney(d?.totalEarnings)}
              </p>
            </div>
          </div>
        </div>

        {/* Online payments */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
            <CreditCard size={17} className="text-blue-500" />
          </div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Online Payments
          </p>
          {isLoading ? (
            <Skeleton className="h-7 w-24 mt-1" />
          ) : (
            <p className="text-2xl font-bold text-gray-900">
              {fmtMoney(d?.earnings?.online)}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-1">Digital & card payments</p>
        </div>

        {/* Offline payments */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center mb-3">
            <Banknote size={17} className="text-green-500" />
          </div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Offline Payments
          </p>
          {isLoading ? (
            <Skeleton className="h-7 w-24 mt-1" />
          ) : (
            <p className="text-2xl font-bold text-gray-900">
              {fmtMoney(d?.earnings?.offline)}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-1">Cash collected</p>
        </div>
      </div>

      {/* ── Breakdown + Today summary ── */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        {/* Earnings breakdown bars */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-4">
            Earnings Breakdown
          </p>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Online */}
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs font-medium text-gray-700">
                    Online Payments
                  </span>
                  <span className="text-xs font-bold text-gray-900">
                    {fmtMoney(d?.earnings?.online)}{" "}
                    <span className="text-gray-400 font-normal">
                      ({onlinePct}%)
                    </span>
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full">
                  <div
                    className="h-2 bg-blue-400 rounded-full transition-all"
                    style={{ width: `${onlinePct}%` }}
                  />
                </div>
              </div>

              {/* Offline */}
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs font-medium text-gray-700">
                    Offline / Cash
                  </span>
                  <span className="text-xs font-bold text-gray-900">
                    {fmtMoney(d?.earnings?.offline)}{" "}
                    <span className="text-gray-400 font-normal">
                      ({offlinePct}%)
                    </span>
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full">
                  <div
                    className="h-2 bg-primary rounded-full transition-all"
                    style={{ width: `${offlinePct}%` }}
                  />
                </div>
              </div>

              {/* Total completed */}
              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1.5">
                  <TrendingUp size={13} className="text-primary" />
                  <span className="text-xs text-gray-500">
                    Completed appointment earnings
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {fmtMoney(d?.totalEarnings)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Today's summary */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-4">
            Today's Summary
          </p>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center px-4 py-3 bg-teal-50 border border-teal-100 rounded-xl">
                <span className="text-sm font-semibold text-primary">
                  Today's Earnings
                </span>
                <span className="text-lg font-bold text-primary">
                  {fmtMoney(d?.todayEarnings)}
                </span>
              </div>
              <div className="flex justify-between items-center px-4 py-3 bg-gray-50 rounded-xl">
                <span className="text-sm font-medium text-gray-700">
                  Appointments Today
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {d?.todayAppointments ?? "—"}
                </span>
              </div>
              <div className="flex justify-between items-center px-4 py-3 bg-gray-50 rounded-xl">
                <span className="text-sm font-medium text-gray-700">
                  Total Patients
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {d?.totalPatients ?? "—"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Payment history table ── */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900">Payment History</h2>
          <span className="text-xs text-gray-400">From latest bookings</span>
        </div>

        {isLoading ? (
          <div className="p-5 space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center py-14 text-sm text-red-400">
            Failed to load payment data.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {[
                  "Patient",
                  "Date",
                  "Token",
                  "Payment Type",
                  "Payment Status",
                  "Amount",
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
              {bookings.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-12 text-sm text-gray-400"
                  >
                    No payment records found.
                  </td>
                </tr>
              ) : (
                bookings.map((b, idx) => {
                  const isPaid = b.paymentStatus === "paid";
                  return (
                    <tr
                      key={b._id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      {/* Patient */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={clsx(
                              "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 capitalize",
                              AVATAR_COLORS[idx % AVATAR_COLORS.length],
                            )}
                          >
                            {getInitials(b.patientName || "")}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 capitalize">
                              {b.patientName || "—"}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              Age: {b.patientAge ?? "—"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-3.5 text-sm text-gray-600">
                        {fmtDate(b.date)}
                      </td>

                      {/* Token */}
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg">
                          #{b.tokenNumber ?? "—"}
                        </span>
                      </td>

                      {/* Payment Type */}
                      <td className="px-5 py-3.5">
                        <span
                          className={clsx(
                            "text-[10px] font-semibold px-2.5 py-1 rounded-full",
                            PAY_TYPE_STYLE[b.paymentType] ??
                              "bg-gray-100 text-gray-600",
                          )}
                        >
                          {PAY_TYPE[b.paymentType] ?? b.paymentType ?? "—"}
                        </span>
                      </td>

                      {/* Payment Status */}
                      <td className="px-5 py-3.5">
                        <span
                          className={clsx(
                            "inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full",
                            isPaid
                              ? "bg-teal-50 text-primary"
                              : "bg-amber-50 text-amber-600",
                          )}
                        >
                          <span className="w-1 h-1 rounded-full bg-current" />
                          {isPaid ? "Paid" : "Pending"}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-3.5">
                        {b.amount ? (
                          <span className="text-sm font-bold text-primary">
                            {fmtMoney(b.amount)}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-300">—</span>
                        )}
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
