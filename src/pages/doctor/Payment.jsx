import clsx from "clsx";
import { useQuery } from "@tanstack/react-query";
import { getDoctorDashboardApi } from "../../api/endpoints/doctor";
import { CreditCard, Banknote, TrendingUp } from "lucide-react";
import icon1 from "../../assets/admin_dash_3.png";
import icon2 from "../../assets/admin_dash_4.png";
import icon3 from "../../assets/doctor_3.png";

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

      <div className="sm:col-span-1 lg:col-span-3 grid grid-cols-3 gap-4 mb-5">
        {/* Appointments */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded bg-red-50 flex items-center justify-center">
              <img src={icon1} alt="" className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
            Total Earnings
          </p>
          {isLoading ? (
            <Skeleton className="h-7 w-16 mt-1" />
          ) : (
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {(d?.totalEarnings ?? 0).toLocaleString()}
            </p>
          )}
        </div>

        {/* Completed Today */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded bg-gray-50 flex items-center justify-center">
              <img src={icon2} alt="" />
            </div>
          </div>
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
            Online Payments
          </p>
          {isLoading ? (
            <Skeleton className="h-7 w-12 mt-1" />
          ) : (
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {d?.onlinePayments ?? 0}
            </p>
          )}
        </div>

        {/* Pending Approvals */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded bg-green-50 flex items-center justify-center">
              <img src={icon3} alt="" />
            </div>
          </div>
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
            Offline Payments
          </p>
          {isLoading ? (
            <Skeleton className="h-7 w-12 mt-1" />
          ) : (
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {d?.offlinePayments ?? 0}
            </p>
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
