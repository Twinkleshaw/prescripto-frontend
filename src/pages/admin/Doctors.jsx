import { useState } from "react";
import {
  Plus,
  Download,
  SlidersHorizontal,
  Trash2,
  Info,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import clsx from "clsx";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  doctorList,
  deleteDoctor,
  exportDoctorsCSV,
} from "../../api/endpoints/doctor";
import AddDoctorModal from "../../components/admin/AddDoctorModal";
import EditDoctorModal from "../../components/admin/EditDoctorModal";
import doctorImg from "../../assets/doctor.png";
import { getImageUrl } from "../../utils/getImageUrl";

export default function AdminDoctors() {
  const [page, setPage] = useState(1);
  const [showAddModal, setAddModal] = useState(false);
  const [editDoctor, setEditDoctor] = useState(null); // holds the doctor object to edit
  const limit = 10;
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["doctors", page],
    queryFn: () => doctorList({ page, limit }),
    keepPreviousData: true,
  });

  const doctors = data?.data?.doctors ?? [];
  const total = data?.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const handleExport = async () => {
    try {
      const response = await exportDoctorsCSV();

      const url = window.URL.createObjectURL(new Blob([response.data]));

      const link = document.createElement("a");

      link.href = url;

      link.setAttribute("download", "doctors-report.csv");

      document.body.appendChild(link);

      link.click();

      link.remove();
    } catch (error) {
      console.error(error);
    }
  };

  const {
    mutate: handleDelete,
    isPending,
    variables,
  } = useMutation({
    mutationFn: deleteDoctor,
    onSuccess: () => queryClient.invalidateQueries(["doctors"]),
    onError: (err) =>
      alert(err?.response?.data?.message || "Failed to delete."),
  });

  return (
    <div className="px-4 sm:px-0">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-5">
        <div>
          <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider mb-1">
            Management
          </p>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Practitioner Registry
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 bg-[#E6E8EA] border border-gray-200 rounded-xl whitespace-nowrap"
          >
            <Download size={13} /> Export CSV
          </button>
          <button
            onClick={() => setAddModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors whitespace-nowrap"
          >
            <Plus size={13} /> Add Doctor
          </button>
        </div>
      </div>
      {/* Summary stats — separate cards with hover green left border */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        {/* Total Specialists */}
        <div className="bg-white border border-gray-200 border-l-[3px] border-l-transparent hover:border-l-emerald-500 rounded-2xl px-5 py-4 transition-colors">
          <p className="text-xs text-[#64748B] font-medium mb-2">
            Total Specialists
          </p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-gray-900">{total}</p>
          </div>
        </div>

        {/* Active Surgeons */}
        <div className="bg-white border border-gray-200 border-l-[3px] border-l-transparent hover:border-l-emerald-500 rounded-2xl px-5 py-4 transition-colors">
          <p className="text-xs text-[#64748B] font-medium mb-2">
            Active Surgeons
          </p>
          <p className="text-2xl font-bold text-gray-900">
            {doctors.filter((d) => d.availabilityStatus).length}
          </p>
          {/* <p className="text-xs text-gray-400 mt-1">Capacity 88%</p> */}
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white border border-gray-200 border-l-[3px] border-l-transparent hover:border-l-emerald-500 rounded-2xl px-5 py-4 transition-colors">
          <p className="text-xs text-[#64748B] font-medium mb-2">
            Monthly Revenue
          </p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-gray-900 truncate">
              ₹{data?.data?.totalRevenue}
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-sm text-gray-400">
            Loading doctors...
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center py-16 text-sm text-red-400">
            Failed to load doctors.
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-12 text-sm text-gray-400">
            No doctors found.
          </div>
        ) : (
          <>
            {/* ── Mobile / tablet card list ── */}
            <div className="md:hidden divide-y divide-gray-50">
              {doctors.map((doc) => {
                const isDeleting = isPending && variables === doc._id;
                const isActive = doc?.isActive && doc?.availabilityStatus;
                return (
                  <div
                    key={doc._id}
                    className={clsx("px-4 py-3.5", isDeleting && "opacity-50")}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={getImageUrl(doc?.image) || doctorImg}
                          alt={doc?.name}
                          className="w-10 h-10 rounded-full object-cover shrink-0 border border-gray-100"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {doc.name}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {doc.email}
                          </p>
                        </div>
                      </div>
                      <span
                        className={clsx(
                          "inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0",
                          isActive
                            ? "bg-teal-50 text-primary"
                            : "bg-red-100 text-red-500",
                        )}
                      >
                        <span
                          className={clsx(
                            "w-1.5 h-1.5 rounded-full",
                            isActive ? "bg-primary" : "bg-red-400",
                          )}
                        />
                        {isActive ? "Active" : "Pause"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-3 text-sm text-gray-600">
                      <span>{doc.speciality || "—"}</span>
                      <div className="flex items-center gap-3">
                        <span>
                          <b className="text-gray-900">
                            {doc?.totalAppointments ?? 0}
                          </b>{" "}
                          appts
                        </span>
                        <span>
                          <b className="text-gray-900">
                            ₹{doc?.totalRevenue ?? 0}
                          </b>
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-end gap-1.5 mt-3">
                      <button
                        title="Edit doctor"
                        onClick={() => setEditDoctor(doc)}
                        className="w-7 h-7 rounded-lg border border-teal-200 bg-teal-50 flex items-center justify-center hover:bg-teal-100 transition-colors"
                      >
                        <Info size={12} className="text-primary" />
                      </button>
                      <button
                        title="Delete doctor"
                        disabled={isDeleting}
                        onClick={() => {
                          if (
                            window.confirm(
                              `Delete ${doc.name}? This cannot be undone.`,
                            )
                          ) {
                            handleDelete(doc._id);
                          }
                        }}
                        className="w-7 h-7 rounded-lg border border-gray-200 bg-white flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-colors disabled:opacity-40"
                      >
                        <Trash2
                          size={12}
                          className="text-gray-400 hover:text-red-400"
                        />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Desktop table ── */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead>
                  <tr className="bg-[#F2F4F6]">
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
                        className="text-left text-[11px] font-semibold text-[#64748B] uppercase tracking-wider px-4 py-3"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {doctors.map((doc) => {
                    const isDeleting = isPending && variables === doc._id;
                    return (
                      <tr
                        key={doc._id}
                        className={clsx(
                          "hover:bg-gray-50/60 transition-colors",
                          isDeleting && "opacity-50",
                        )}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={getImageUrl(doc?.image) || doctorImg}
                              alt={doc?.name}
                              className="w-9 h-9 rounded-full object-cover shrink-0 border border-gray-100"
                            />
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {doc.name}
                              </p>
                              <p className="text-xs text-gray-400">
                                {doc.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {doc.speciality || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={clsx(
                              "inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full",
                              doc.isActive && doc.availabilityStatus
                                ? "bg-teal-50 text-primary"
                                : "bg-red-100 text-red-500",
                            )}
                          >
                            <span
                              className={clsx(
                                "w-1.5 h-1.5 rounded-full",
                                doc?.isActive && doc?.availabilityStatus
                                  ? "bg-primary"
                                  : "bg-red-400",
                              )}
                            />
                            {doc?.isActive && doc?.availabilityStatus
                              ? "Active"
                              : "Pause"}
                          </span>
                        </td>
                        <td className="px-8  py-3 text-sm text-gray-600">
                          <b>{doc?.totalAppointments ?? 0}</b>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <b>₹{doc?.totalRevenue ?? 0}</b>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex gap-1.5">
                            {/* ✅ Edit button — opens EditDoctorModal with this doctor */}
                            <button
                              title="Edit doctor"
                              onClick={() => setEditDoctor(doc)}
                              className="w-7 h-7 rounded-lg border border-teal-200 bg-teal-50 flex items-center justify-center hover:bg-teal-100 transition-colors"
                            >
                              <Info size={12} className="text-primary" />
                            </button>
                            <button
                              title="Delete doctor"
                              disabled={isDeleting}
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Delete ${doc.name}? This cannot be undone.`,
                                  )
                                ) {
                                  handleDelete(doc._id);
                                }
                              }}
                              className="w-7 h-7 rounded-lg border border-gray-200 bg-white flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-colors disabled:opacity-40"
                            >
                              <Trash2
                                size={12}
                                className="text-gray-400 hover:text-red-400"
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Pagination */}
        {!isLoading && !isError && (
          <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-400 text-center sm:text-left">
              Showing {Math.min((page - 1) * limit + 1, total)}–
              {Math.min(page * limit, total)} of {total} doctors
            </span>
            <div className="flex gap-1 flex-wrap justify-center">
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

      {/* Modals */}
      {showAddModal && <AddDoctorModal onClose={() => setAddModal(false)} />}
      {editDoctor && (
        <EditDoctorModal
          doctor={editDoctor}
          onClose={() => setEditDoctor(null)}
        />
      )}
    </div>
  );
}
