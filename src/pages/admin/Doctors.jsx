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
import { doctorList, deleteDoctor } from "../../api/endpoints/doctor";
import AddDoctorModal from "../../components/admin/AddDoctorModal";
import EditDoctorModal from "../../components/admin/EditDoctorModal";
import doctorImg from "../../assets/doctor.png";

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
          <button
            onClick={() => setAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors"
          >
            <Plus size={13} /> Add Doctor
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 bg-white border border-gray-200 rounded-2xl overflow-hidden mb-5 divide-x divide-gray-100">
        <div className="px-5 py-4">
          <p className="text-xs text-gray-400 font-medium mb-1">
            Total Doctors
          </p>
          <p className="text-xl font-bold text-gray-900">{total}</p>
        </div>
        <div className="px-5 py-4">
          <p className="text-xs text-gray-400 font-medium mb-1">Active</p>
          <p className="text-xl font-bold text-gray-900">
            {doctors.filter((d) => d.isActive).length}
            <span className="text-xs text-gray-400 font-normal ml-1">
              this page
            </span>
          </p>
        </div>
        <div className="px-5 py-4">
          <p className="text-xs text-gray-400 font-medium mb-1">
            Available Now
          </p>
          <p className="text-xl font-bold text-gray-900">
            {doctors.filter((d) => d.availabilityStatus).length}
            <span className="text-xs text-gray-400 font-normal ml-1">
              this page
            </span>
          </p>
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
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {[
                  "Doctor Name",
                  "Speciality",
                  "City",
                  "Experience",
                  "Fees",
                  "Status",
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
              {doctors.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-12 text-sm text-gray-400"
                  >
                    No doctors found.
                  </td>
                </tr>
              ) : (
                doctors.map((doc) => {
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
                            src={doc.image || doctorImg}
                            alt={doc.name}
                            className="w-9 h-9 rounded-full object-cover shrink-0 border border-gray-100"
                          />
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {doc.name}
                            </p>
                            <p className="text-xs text-gray-400">{doc.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {doc.speciality || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {doc.address?.city || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {doc.experience || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">
                        {doc.fees ? `₹${doc.fees}` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={clsx(
                            "inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full",
                            doc.isActive && doc.availabilityStatus
                              ? "bg-teal-50 text-primary"
                              : "bg-gray-100 text-gray-500",
                          )}
                        >
                          <span
                            className={clsx(
                              "w-1.5 h-1.5 rounded-full",
                              doc.isActive && doc.availabilityStatus
                                ? "bg-primary"
                                : "bg-gray-400",
                            )}
                          />
                          {doc.isActive && doc.availabilityStatus
                            ? "Active"
                            : "Inactive"}
                        </span>
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
                })
              )}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {!isLoading && !isError && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">
              Showing {Math.min((page - 1) * limit + 1, total)}–
              {Math.min(page * limit, total)} of {total} doctors
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
