import { useState, useEffect, useRef } from "react";
import { X, User } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateDoctor } from "../../api/endpoints/doctor";
import clsx from "clsx";
import { getImageUrl } from "../../utils/getImageUrl";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const inputCls =
  "w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-primary focus:bg-white transition-colors";

// ── sub-components ────────────────────────────────────────
function Field({ label, children, full }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <div
        onClick={() => onChange(!checked)}
        className={clsx(
          "w-10 h-5 rounded-full transition-colors relative shrink-0",
          checked ? "bg-primary" : "bg-gray-200",
        )}
      >
        <span
          className={clsx(
            "absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform",
            checked ? "translate-x-5" : "translate-x-0.5",
          )}
        />
      </div>
      <span className="text-xs font-medium text-gray-600">{label}</span>
    </label>
  );
}

// ── main component ────────────────────────────────────────
export default function EditDoctorModal({ doctor, onClose }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [imageFile, setImageFile] = useState(null);
  const fileRef = useRef(null);

  const [imagePreview, setImagePreview] = useState(
    getImageUrl(doctor?.image) || null,
  );
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Maximum image size is 5MB");
      return;
    }

    setImageFile(file);

    setImagePreview(URL.createObjectURL(file));
  };

  // Pre-fill form with existing doctor data
  const [form, setForm] = useState({
    speciality: "",
    specialityBengali: "",
    degree: "",
    experience: "",
    description: "",
    fees: "",
    image: "",
    startTime: "",
    endTime: "",
    slotDuration: "10",
    availableDays: [],
    availabilityStatus: true,
    isActive: true,
    address: {
      city: "",
      state: "",
      pinCode: "",
      street: "",
      landmark: "",
    },
    bankDetails: {
      accountHolderName: "",
      accountNumber: "",
      ifscCode: "",
      bankName: "",
    },
    googleMapLink: "",
  });

  // Populate form when doctor prop changes
  useEffect(() => {
    if (!doctor) return;
    setImagePreview(getImageUrl(doctor?.image) || null);
    setForm({
      speciality: doctor.speciality ?? "",
      specialityBengali: doctor.specialityBengali ?? "",
      degree: doctor.degree ?? "",
      experience: doctor.experience ?? "",
      description: doctor.description ?? "",
      fees: doctor.fees ?? "",
      image: doctor.image ?? "",
      startTime: doctor.startTime ?? "",
      endTime: doctor.endTime ?? "",
      slotDuration: doctor.slotDuration ?? "10",
      availableDays: doctor.availableDays ?? [],
      availabilityStatus: doctor.availabilityStatus ?? true,
      isActive: doctor.isActive ?? true,
      address: {
        city: doctor.address?.city ?? "",
        state: doctor.address?.state ?? "",
        pinCode: doctor.address?.pinCode ?? "",
        street: doctor.address?.street ?? "",
        landmark: doctor.address?.landmark ?? "",
      },
      bankDetails: {
        accountHolderName: doctor.bankDetails?.accountHolderName ?? "",

        accountNumber: doctor.bankDetails?.accountNumber ?? "",

        ifscCode: doctor.bankDetails?.ifscCode ?? "",

        bankName: doctor.bankDetails?.bankName ?? "",
      },
      googleMapLink: doctor.googleMapLink ?? "",
    });
  }, [doctor]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const setAddr = (key, val) =>
    setForm((f) => ({ ...f, address: { ...f.address, [key]: val } }));
  const setBank = (key, val) =>
    setForm((f) => ({
      ...f,
      bankDetails: {
        ...f.bankDetails,
        [key]: val,
      },
    }));

  const toggleDay = (day) =>
    setForm((f) => ({
      ...f,
      availableDays: f.availableDays.includes(day)
        ? f.availableDays.filter((d) => d !== day)
        : [...f.availableDays, day],
    }));

  const { mutate, isPending, error } = useMutation({
    mutationFn: ({ id, data }) => updateDoctor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["doctors"]);
      onClose();
    },
  });

  const handleSubmit = () => {
    console.log("handlesbumit", doctor?._id);
    const formData = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      if (typeof value === "object" && value !== null) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    });

    if (imageFile) {
      formData.append("image", imageFile);
    }

    mutate({
      id: doctor?._id,
      data: formData,
    });
  };

  const steps = [
    { n: 1, label: "Basic Info" },
    { n: 2, label: "Schedule" },
    { n: 3, label: "Address" },
    { n: 4, label: "Bank Details" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm sm:px-4">
      <div className="bg-white shadow-xl w-full h-full sm:h-auto sm:rounded-2xl sm:w-full sm:max-w-xl sm:max-h-[88vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100">
          <div className="min-w-0">
            <h2 className="text-base font-bold text-gray-900">
              Edit Doctor Profile
            </h2>
            <p className="text-xs text-gray-400 mt-0.5 truncate">
              {doctor?.name}
              {doctor?.speciality ? ` • ${doctor.speciality}` : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors flex-shrink-0 ml-3"
          >
            <X size={15} className="text-gray-500" />
          </button>
        </div>

        {/* Step tabs — horizontally scrollable on small screens */}
        <div className="flex gap-2 px-4 sm:px-6 py-3 border-b border-gray-100 overflow-x-auto no-scrollbar">
          {steps.map(({ n, label }) => (
            <button
              key={n}
              type="button"
              onClick={() => setStep(n)}
              className={clsx(
                "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap flex-shrink-0",
                step === n
                  ? "bg-primary text-white"
                  : step > n
                    ? "bg-teal-50 text-primary border border-teal-200"
                    : "bg-gray-100 text-gray-400",
              )}
            >
              <span
                className={clsx(
                  "w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold",
                  step === n
                    ? "bg-white/20 text-white"
                    : step > n
                      ? "bg-primary text-white"
                      : "bg-gray-200 text-gray-500",
                )}
              >
                {step > n ? "✓" : n}
              </span>
              {label}
            </button>
          ))}
        </div>

        {/* Form body */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5">
          {/* ── Step 1: Basic Info ── */}
          {step === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Speciality">
                <input
                  value={form.speciality}
                  onChange={(e) => set("speciality", e.target.value)}
                  placeholder="Enter speciality (e.g. Cardiology)"
                  className={inputCls}
                />
              </Field>
              <Field label="Speciality (Bengali)">
                <input
                  value={form.specialityBengali}
                  onChange={(e) => set("specialityBengali", e.target.value)}
                  placeholder="বিশেষত্ব"
                  className={inputCls}
                />
              </Field>
              <Field label="Degree">
                <input
                  value={form.degree}
                  onChange={(e) => set("degree", e.target.value)}
                  placeholder="MBBS, MD"
                  className={inputCls}
                />
              </Field>
              <Field label="Experience">
                <input
                  value={form.experience}
                  onChange={(e) => set("experience", e.target.value)}
                  placeholder="e.g. 8 Years"
                  className={inputCls}
                />
              </Field>
              <Field label="Consultation Fees (₹)">
                <input
                  type="number"
                  value={form.fees}
                  onChange={(e) => set("fees", e.target.value)}
                  placeholder="500"
                  min={0}
                  className={inputCls}
                />
              </Field>
              <Field label="Profile Image">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="w-10 h-10 rounded-full border border-gray-200 bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={16} className="text-gray-400" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                  >
                    Choose Photo
                  </button>
                  {imageFile && (
                    <span className="text-xs text-gray-400 truncate max-w-[120px]">
                      {imageFile.name}
                    </span>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>
              </Field>

              <Field label="Description" full>
                <textarea
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Brief about the doctor..."
                  rows={3}
                  className={clsx(inputCls, "resize-none")}
                />
              </Field>
              {/* Toggles */}
              <div className="col-span-1 sm:col-span-2 flex flex-wrap gap-x-8 gap-y-3 pt-1">
                <Toggle
                  label="Availability Status"
                  checked={form.availabilityStatus}
                  onChange={(v) => set("availabilityStatus", v)}
                />
                <Toggle
                  label="Is Active"
                  checked={form.isActive}
                  onChange={(v) => set("isActive", v)}
                />
              </div>
            </div>
          )}

          {/* ── Step 2: Schedule ── */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Start Time">
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => set("startTime", e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="End Time">
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) => set("endTime", e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Slot Duration (mins)">
                  <input
                    type="number"
                    value={form.slotDuration}
                    onChange={(e) => set("slotDuration", e.target.value)}
                    min={5}
                    max={60}
                    className={inputCls}
                  />
                </Field>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2">
                  Available Days
                </p>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={clsx(
                        "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors",
                        form.availableDays.includes(day)
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-gray-500 border-gray-200 hover:border-primary hover:text-primary",
                      )}
                    >
                      {day}
                    </button>
                  ))}
                </div>
                {form.availableDays.length > 0 && (
                  <p className="text-xs text-gray-400 mt-2">
                    Selected: {form.availableDays.join(", ")}
                  </p>
                )}
              </div>

              {/* Slot preview */}
              {form.startTime && form.endTime && form.slotDuration && (
                <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 text-xs text-teal-700">
                  <p className="font-bold mb-1">Slot Preview</p>
                  <p>
                    {form.startTime} → {form.endTime} • Every{" "}
                    {form.slotDuration} mins • ~
                    {Math.floor(
                      (parseInt(form.endTime) * 60 +
                        parseInt(form.endTime.split(":")[1]) -
                        parseInt(form.startTime) * 60 -
                        parseInt(form.startTime.split(":")[1])) /
                        Number(form.slotDuration),
                    )}{" "}
                    slots/day
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Step 3: Address ── */}
          {step === 3 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Street">
                <input
                  value={form.address.street}
                  onChange={(e) => setAddr("street", e.target.value)}
                  placeholder="123 Main St"
                  className={inputCls}
                />
              </Field>

              <Field label="Landmark">
                <input
                  value={form.address.landmark}
                  onChange={(e) => setAddr("landmark", e.target.value)}
                  placeholder="Near City Hospital"
                  className={inputCls}
                />
              </Field>

              <Field label="City">
                <input
                  value={form.address.city}
                  onChange={(e) => setAddr("city", e.target.value)}
                  placeholder="Kolkata"
                  className={inputCls}
                />
              </Field>

              <Field label="State">
                <input
                  value={form.address.state}
                  onChange={(e) => setAddr("state", e.target.value)}
                  placeholder="West Bengal"
                  className={inputCls}
                />
              </Field>

              <Field label="Pin Code">
                <input
                  value={form.address.pinCode}
                  onChange={(e) => setAddr("pinCode", e.target.value)}
                  placeholder="700001"
                  maxLength={6}
                  className={inputCls}
                />
              </Field>

              <Field label="Google Map Link">
                <input
                  value={form.googleMapLink}
                  onChange={(e) => set("googleMapLink", e.target.value)}
                  placeholder="https://maps.google.com/..."
                  className={inputCls}
                />
              </Field>
            </div>
          )}
          {step === 4 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Account Holder Name">
                <input
                  value={form.bankDetails.accountHolderName}
                  onChange={(e) => setBank("accountHolderName", e.target.value)}
                  className={inputCls}
                />
              </Field>

              <Field label="Account Number">
                <input
                  value={form.bankDetails.accountNumber}
                  onChange={(e) => setBank("accountNumber", e.target.value)}
                  className={inputCls}
                />
              </Field>

              <Field label="IFSC Code">
                <input
                  value={form.bankDetails.ifscCode}
                  onChange={(e) => setBank("ifscCode", e.target.value)}
                  className={inputCls}
                />
              </Field>

              <Field label="Bank Name">
                <input
                  value={form.bankDetails.bankName}
                  onChange={(e) => setBank("bankName", e.target.value)}
                  className={inputCls}
                />
              </Field>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="mt-4 text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              {error?.response?.data?.message || "Something went wrong."}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 text-center sm:text-left"
          >
            Cancel
          </button>
          <div className="flex gap-2">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="flex-1 sm:flex-none px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                ← Back
              </button>
            )}
            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="flex-1 sm:flex-none px-5 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl transition-colors"
              >
                Next →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isPending}
                className="flex-1 sm:flex-none px-5 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl transition-colors disabled:opacity-60"
              >
                {isPending ? "Saving..." : "Save Changes"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
