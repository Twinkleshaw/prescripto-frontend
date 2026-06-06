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
  paid: { badge: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  pending: { badge: "bg-amber-50 text-amber-700", dot: "bg-amber-400" },
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
  "$" + Number(a).toLocaleString("en-US", { minimumFractionDigits: 2 });

// ── Constants ─────────────────────────────────────────────────────────────────
const PER_PAGE = 6;
const TABS = [
  { key: "all", label: "All Invoices" },
  { key: "paid", label: "Paid" },
  { key: "pending", label: "Pending" },
  { key: "overdue", label: "Overdue" },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [downloading, setDownloading] = useState(null); // fix: was missing

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

  // fix: moved inside component so it can access setDownloading
  const handleDownload = async (inv) => {
    console.log(inv);
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

  // fix: was called handleFilterChange in JSX but defined as handleFilter
  const handleFilterChange = (key) => {
    setFilter(key);
    setPage(1);
  };

  return (
    <div className="p-6">
      {/* Tabs */}
      <div className="flex items-center mb-5">
        <div className="flex gap-1 bg-gray-100 rounded-full p-1">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleFilterChange(key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
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

      {/* Table card */}
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
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-red-500">
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

        {/* Table */}
        {!loading && !error && (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
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
                      className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-14 text-center">
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <FileText size={20} />
                        <span className="text-sm">No invoices found</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pageRows.map((inv) => {
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
                        {/* ID */}
                        <td className="px-4 py-4">
                          <span className="text-xs font-medium text-indigo-500">
                            #{inv.invoiceId}
                          </span>
                        </td>

                        {/* Patient */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${color.bg} ${color.text}`}
                            >
                              {getInitials(inv.patientName)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 leading-tight">
                                {inv.patientName}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {inv.speciality?.trim() || inv.doctorName}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Service Date */}
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {formatDate(inv.serviceDate)}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${style.badge}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${style.dot}`}
                            />
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                          {formatAmount(inv.amount)}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4">
                          <button
                            onClick={() => handleDownload(inv)}
                            disabled={isDownloading}
                            title="Download Invoice PDF"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#008379] bg-teal-50 hover:bg-teal-100 border border-teal-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {isDownloading ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <Download size={13} />
                            )}
                            {isDownloading ? "Generating…" : "Download"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Footer / Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-400">
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
              <div className="flex gap-1.5">
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
