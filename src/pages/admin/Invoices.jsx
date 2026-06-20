import { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
  FileText,
  Download,
} from "lucide-react";
import { downloadInvoicePDF, getInvoices } from "../../api/endpoints/invoices";

// ── Helpers ───────────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  paid: { badge: "bg-[#DCFCE7] text-[#15803D]", dot: "bg-[#22C55E]" },
  pending: { badge: "bg-[#FEF3C7] text-[#B45309]", dot: "bg-[#F59E0B]" },
  overdue: { badge: "bg-red-50 text-red-600", dot: "bg-red-500" },
};

const AVATAR_COLORS = [
  { bg: "bg-blue-100", text: "text-blue-700" },
  { bg: "bg-purple-100", text: "text-purple-700" },
  { bg: "bg-pink-100", text: "text-pink-700" },
  { bg: "bg-emerald-100", text: "text-emerald-700" },
  { bg: "bg-amber-100", text: "text-amber-700" },
  { bg: "bg-red-100", text: "text-red-700" },
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

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const formatAmount = (a) =>
  "₹" + Number(a).toLocaleString("en-US", { minimumFractionDigits: 2 });

// ── Constants ─────────────────────────────────────────────────────────────────
const PER_PAGE = 6;
const TABS = [
  { key: "all", label: "All Invoices" },
  { key: "paid", label: "Paid" },
  { key: "pending", label: "Pending" },
  { key: "overdue", label: "Overdue" },
];

// ── Small presentational pieces ─────────────────────────────────────────────
function StatusBadge({ status, style }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${style.badge}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${style.dot}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function DownloadButton({ isDownloading, onClick, full = false }) {
  return (
    <button
      onClick={onClick}
      disabled={isDownloading}
      title="Download Invoice PDF"
      className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#008379] bg-teal-50 hover:bg-teal-100 border border-teal-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
        full ? "w-full" : ""
      }`}
    >
      {isDownloading ? (
        <Loader2 size={13} className="animate-spin" />
      ) : (
        <Download size={13} />
      )}
      {isDownloading ? "Generating…" : "Download"}
    </button>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [downloading, setDownloading] = useState(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getInvoices();
      setInvoices(data.invoices || []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to load invoices",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleDownload = async (inv) => {
    setDownloading(inv.invoiceId);
    try {
      const response = await downloadInvoicePDF(inv?.appointmentId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Invoice-${inv.invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloading(null);
    }
  };

  const filtered =
    filter === "all"
      ? invoices
      : invoices.filter((inv) => inv.paymentStatus?.toLowerCase() === filter);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const start = (page - 1) * PER_PAGE;
  const pageRows = filtered.slice(start, start + PER_PAGE);

  const handleFilterChange = (key) => {
    setFilter(key);
    setPage(1);
  };

  return (
    <div className="p-3 sm:p-6">
      {/* Tabs — horizontally scrollable on small screens */}
      <div className="flex items-center mb-4 sm:mb-5 -mx-3 px-3 sm:mx-0 sm:px-0 overflow-x-auto no-scrollbar">
        <div className="flex gap-1 bg-gray-100 rounded-full p-1 w-max">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleFilterChange(key)}
              className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                filter === key
                  ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Card */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center gap-2 py-16 text-gray-400">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">Loading invoices…</span>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-red-500 px-4 text-center">
            <AlertCircle size={22} />
            <span className="text-sm">{error}</span>
            <button
              onClick={fetchInvoices}
              className="mt-1 text-xs text-gray-500 underline hover:text-gray-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty state (shared) */}
        {!loading && !error && pageRows.length === 0 && (
          <div className="flex flex-col items-center gap-2 text-gray-400 py-14">
            <FileText size={20} />
            <span className="text-sm">No invoices found</span>
          </div>
        )}

        {/* Content */}
        {!loading && !error && pageRows.length > 0 && (
          <>
            {/* ── Mobile: stacked cards (below md) ───────────────────────── */}
            <div className="md:hidden divide-y divide-gray-50">
              {pageRows.map((inv) => {
                const status = inv.paymentStatus?.toLowerCase() || "pending";
                const style = STATUS_STYLES[status] || STATUS_STYLES.pending;
                const color = getAvatarColor(inv.patientName);
                const isDownloading = downloading === inv.invoiceId;

                return (
                  <div key={inv.invoiceId} className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${color.bg} ${color.text}`}
                        >
                          {getInitials(inv.patientName)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 leading-tight truncate">
                            {inv.patientName}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5 truncate">
                            {inv.speciality?.trim() || inv.doctorName}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#94A3B8] flex-shrink-0">
                        #{inv.invoiceId}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-gray-400">
                        {formatDate(inv.serviceDate)}
                      </span>
                      <StatusBadge status={status} style={style} />
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <span className="text-base font-semibold text-gray-900">
                        {formatAmount(inv.amount)}
                      </span>
                      <DownloadButton
                        isDownloading={isDownloading}
                        onClick={() => handleDownload(inv)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Desktop / tablet: table (md and up) ────────────────────── */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead>
                  <tr>
                    {[
                      "ID",
                      "Patient",
                      "Service Date",
                      "Status",
                      "Amount",
                      "Actions",
                    ].map((col) => (
                      <th
                        key={col}
                        className="px-4 py-3 text-left text-[11px] bg-[#F2F4F680] font-semibold text-[#94A3B8] uppercase tracking-wider"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {pageRows.map((inv) => {
                    const status =
                      inv.paymentStatus?.toLowerCase() || "pending";
                    const style =
                      STATUS_STYLES[status] || STATUS_STYLES.pending;
                    const color = getAvatarColor(inv.patientName);
                    const isDownloading = downloading === inv.invoiceId;

                    return (
                      <tr
                        key={inv.invoiceId}
                        className="border-b border-gray-50 last:border-none hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-4">
                          <span className="text-xs font-bold text-[#94A3B8]">
                            #{inv.invoiceId}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${color.bg} ${color.text}`}
                            >
                              {getInitials(inv.patientName)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 leading-tight truncate">
                                {inv.patientName}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5 truncate">
                                {inv.speciality?.trim() || inv.doctorName}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">
                          {formatDate(inv.serviceDate)}
                        </td>

                        <td className="px-4 py-4">
                          <StatusBadge status={status} style={style} />
                        </td>

                        <td className="px-4 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                          {formatAmount(inv.amount)}
                        </td>

                        <td className="px-4 py-4">
                          <DownloadButton
                            isDownloading={isDownloading}
                            onClick={() => handleDownload(inv)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer / Pagination */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-400 text-center sm:text-left">
                Showing{" "}
                <span className="font-medium text-gray-700">
                  {filtered.length === 0 ? 0 : start + 1}–
                  {Math.min(start + PER_PAGE, filtered.length)}
                </span>{" "}
                of{" "}
                <span className="font-medium text-gray-700">
                  {filtered.length}
                </span>{" "}
                results
              </p>
              <div className="flex justify-center sm:justify-end gap-1.5">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page <= 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
