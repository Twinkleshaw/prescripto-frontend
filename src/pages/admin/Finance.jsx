import { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Wallet,
  Loader2,
  AlertCircle,
  CreditCard,
  ArrowUpRight,
  Download,
} from "lucide-react";

import { exportFinanceCSV, getFinanceData } from "../../api/endpoints/invoices";
import icon from "../../assets/admin_dash_4.png";

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) =>
  "₹" + Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2 });

const AVATAR_COLORS = [
  { bg: "bg-blue-100", text: "text-blue-700" },
  { bg: "bg-purple-100", text: "text-purple-700" },
  { bg: "bg-pink-100", text: "text-pink-700" },
  { bg: "bg-emerald-100", text: "text-emerald-700" },
  { bg: "bg-amber-100", text: "text-amber-700" },
  { bg: "bg-teal-100", text: "text-teal-700" },
];

const getAvatarColor = (name = "") => {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
};

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const STATUS_STYLES = {
  pending: {
    badge: "bg-[#FFDAD6] text-[#93000A] border border-red-100",
    label: "Pending",
  },
  paid: {
    badge: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    label: "Paid",
  },
  completed: {
    badge: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    label: "Paid",
  },
  failed: {
    badge: "bg-gray-100 text-gray-500 border border-gray-200",
    label: "Failed",
  },
};

const PER_PAGE = 6;

// ── Component ─────────────────────────────────────────────────────────────────
export default function Finance() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: res } = await getFinanceData();
      setData(res);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to load finance data",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const [exporting, setExporting] = useState(false);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const response = await exportFinanceCSV();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Finance-Report-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      console.log("hi");
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-32 text-gray-400">
        <Loader2 size={20} className="animate-spin" />
        <span className="text-sm">Loading finance data…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-32 text-red-500">
        <AlertCircle size={22} />
        <span className="text-sm">{error}</span>
        <button
          onClick={fetchData}
          className="mt-1 text-xs text-gray-500 underline hover:text-gray-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const payments = data?.payments || [];
  const doctorPayments = data?.doctorPayments || [];
  const totalPages = Math.ceil(payments.length / PER_PAGE);
  const start = (page - 1) * PER_PAGE;
  const pageRows = payments.slice(start, start + PER_PAGE);

  // top 4 doctor avatars for display
  const topDoctors = doctorPayments.slice(0, 4);

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* ── Top Stats Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total User Payments — hero card */}
        <div className="sm:col-span-2 relative bg-[#006860] rounded-2xl p-5 sm:p-6 overflow-hidden">
          {/* watermark icon */}
          <div className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 opacity-10">
            <Wallet
              size={90}
              strokeWidth={1}
              className="text-white sm:hidden"
            />
            <Wallet
              size={120}
              strokeWidth={1}
              className="text-white hidden sm:block"
            />
          </div>
          <p className="text-[11px] font-semibold tracking-widest text-teal-200 uppercase mb-3">
            Total User Payments Received
          </p>
          <p className="text-3xl sm:text-4xl font-bold text-white mb-5 truncate">
            {fmt(data?.totalCollected)}
          </p>
          <div className="flex gap-3">
            {/* <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-lg px-3 py-1.5">
              <TrendingUp size={13} className="text-teal-200" />
              <span className="text-xs font-semibold text-white">
                +
                {(
                  ((data?.totalCollected || 0) / (data?.totalBilling || 1)) *
                  100
                ).toFixed(1)}
                %
              </span>
              <span className="text-[10px] text-teal-200">collected</span>
            </div> */}
            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-lg px-3 py-1.5">
              <CreditCard size={13} className="text-teal-200" />
              <span className="text-xs font-semibold text-white">
                {payments.length} Items
              </span>
            </div>
          </div>
        </div>

        {/* Total Doctor Payments */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col justify-between">
          <div className="w-10 h-10 bg-[#D2E4FF] rounded-xl flex items-center justify-center mb-3">
            <img src={icon} alt="" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium mb-1">
              Total Doctor Payments
            </p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
              {fmt(
                doctorPayments.reduce((s, d) => s + (d.totalCollected || 0), 0),
              )}
            </p>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="flex -space-x-2">
              {topDoctors.map((d) => {
                const c = getAvatarColor(d.doctorName);
                return (
                  <div
                    key={d._id}
                    className={`w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold ${c.bg} ${c.text}`}
                  >
                    {getInitials(d.doctorName)}
                  </div>
                );
              })}
              {doctorPayments.length > 4 && (
                <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[9px] font-bold text-gray-500">
                  +{doctorPayments.length - 4}
                </div>
              )}
            </div>
            {/* <button className="text-xs font-semibold text-[#008379] hover:underline flex items-center gap-1">
              Manage Payouts <ArrowUpRight size={12} />
            </button> */}
          </div>
        </div>
      </div>

      {/* ── Bottom Row: Doctor Records + Payments Table ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Doctor Records */}
        <div className="lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-semibold tracking-widest text-gray-500 uppercase">
              Doctor Records
            </p>
          </div>
          <div className="space-y-2 bg-[#F2F4F6] p-2 rounded-xl">
            {doctorPayments.map((doc) => {
              const c = getAvatarColor(doc.doctorName);
              return (
                <div
                  key={doc._id}
                  className="bg-white  rounded-xl px-4 py-3 flex items-center gap-3 hover:border-teal-200 transition-colors"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${c.bg} ${c.text}`}
                  >
                    {getInitials(doc.doctorName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {doc.doctorName}
                    </p>
                    <p className="text-[10px] text-gray-400 truncate">
                      ID: DOC-{String(doc._id).slice(-6).toUpperCase()}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-[#008379]">
                      {fmt(doc.totalCollected)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payments Table */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
            <p className="text-[11px] font-semibold tracking-widest text-gray-500 uppercase">
              Pending Approvals
            </p>
            <button
              onClick={handleExportCSV}
              disabled={exporting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-[#006860] hover:bg-teal-100 border border-teal-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {exporting ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Download size={13} />
              )}
              {exporting ? "Exporting…" : "Export CSV"}
            </button>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            {pageRows.length === 0 ? (
              <div className="py-12 text-center text-sm text-gray-400">
                No payments found
              </div>
            ) : (
              <>
                {/* ── Mobile / tablet card list ── */}
                <div className="md:hidden divide-y divide-gray-50">
                  {pageRows.map((pay) => {
                    const status =
                      pay.paymentStatus?.toLowerCase() || "pending";
                    const style =
                      STATUS_STYLES[status] || STATUS_STYLES.pending;
                    const color = getAvatarColor(pay.patientName || "");
                    const txId = `#VT-TXN-${String(pay._id).slice(-5).toUpperCase()}`;

                    return (
                      <div key={pay._id} className="px-4 py-3.5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${color.bg} ${color.text}`}
                            >
                              {getInitials(pay.patientName || "")}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 leading-tight truncate">
                                {pay.patientName}
                              </p>
                              <p className="text-[10px] text-gray-400 truncate">
                                {pay.doctorId?.speciality?.trim() || "—"}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-md shrink-0 ${style.badge}`}
                          >
                            {style.label.toUpperCase()}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-3 text-[11px] text-gray-500">
                          <span>{txId}</span>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                pay.paymentType === "online"
                                  ? "bg-emerald-400"
                                  : "bg-gray-300"
                              }`}
                            />
                            <span>
                              {pay.paymentType === "online"
                                ? `${pay.patientName?.toLowerCase().replace(" ", ".")}.upi`
                                : "Pay at Clinic"}
                            </span>
                          </div>
                        </div>

                        <div className="mt-2">
                          <span className="text-sm font-bold text-gray-900">
                            {fmt(pay.amount)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ── Desktop table ── */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full min-w-[640px]">
                    <thead>
                      <tr className="bg-[#F2F4F6]">
                        {[
                          "Transaction ID",
                          "Name",
                          "Method",
                          "Amount",
                          "Status",
                        ].map((col) => (
                          <th
                            key={col}
                            className="px-4 py-3 text-left text-[10px] font-semibold text-[#64748B] uppercase tracking-wider"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pageRows.map((pay) => {
                        const status =
                          pay.paymentStatus?.toLowerCase() || "pending";
                        const style =
                          STATUS_STYLES[status] || STATUS_STYLES.pending;
                        const color = getAvatarColor(pay.patientName || "");
                        const txId = `#VT-TXN-${String(pay._id).slice(-5).toUpperCase()}`;

                        return (
                          <tr
                            key={pay._id}
                            className="border-b border-gray-50 last:border-none hover:bg-gray-50 transition-colors"
                          >
                            {/* Transaction ID */}
                            <td className="px-4 py-3">
                              <span className="text-[11px] font-medium text-gray-500">
                                {txId}
                              </span>
                            </td>

                            {/* Name */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${color.bg} ${color.text}`}
                                >
                                  {getInitials(pay.patientName || "")}
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-gray-900 leading-tight">
                                    {pay.patientName}
                                  </p>
                                  <p className="text-[10px] text-gray-400">
                                    {pay.doctorId?.speciality?.trim() || "—"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Method */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                    pay.paymentType === "online"
                                      ? "bg-emerald-400"
                                      : "bg-gray-300"
                                  }`}
                                />
                                <span className="text-[11px] text-gray-500">
                                  {pay.paymentType === "online"
                                    ? `${pay.patientName?.toLowerCase().replace(" ", ".")}.upi`
                                    : "Pay at Clinic"}
                                </span>
                              </div>
                            </td>

                            {/* Amount */}
                            <td className="px-4 py-3">
                              <span className="text-sm font-bold text-gray-900">
                                {fmt(pay.amount)}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="px-4 py-3">
                              <span
                                className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${style.badge}`}
                              >
                                {style.label.toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Footer */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-2 px-4 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-400 text-center sm:text-left">
                Showing{" "}
                <span className="font-medium text-gray-700">
                  {payments.length === 0 ? 0 : start + 1}–
                  {Math.min(start + PER_PAGE, payments.length)}
                </span>{" "}
                of{" "}
                <span className="font-medium text-gray-700">
                  {payments.length}
                </span>{" "}
                pending transactions
              </p>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page <= 1}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
