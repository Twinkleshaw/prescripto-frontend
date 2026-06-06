import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { doctorUpdateProfile } from "../../api/endpoints/doctor";
import { useAuthStore } from "../../store/authStore";
import clsx from "clsx";

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

function Field({ label, children }) {
  return (
    <div>
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

export default function DoctorProfile() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState("profile");
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    description: "",
    fees: "",
    startTime: "",
    endTime: "",
    slotDuration: "10",
    availableDays: [],
    availabilityStatus: true,
    address: { city: "", state: "", pinCode: "", street: "", landmark: "" },
    bankDetails: {
      accountHolderName: "",
      accountNumber: "",
      ifscCode: "",
      bankName: "",
    },
    googleMapLink: "",
  });

  console.log(user);

  // Pre-fill from user store
  useEffect(() => {
    if (!user) return;
    setForm({
      description: user.description ?? "",
      fees: user.fees ?? "",
      startTime: user.startTime ?? "",
      endTime: user.endTime ?? "",
      slotDuration: user.slotDuration ?? "10",
      availableDays: user.availableDays ?? [],
      availabilityStatus: user.availabilityStatus ?? true,
      address: {
        city: user.address?.city ?? "",
        state: user.address?.state ?? "",
        pinCode: user.address?.pinCode ?? "",
        street: user.address?.street ?? "",
        landmark: user.address?.landmark ?? "",
      },
      bankDetails: {
        accountHolderName: user.bankDetails?.accountHolderName ?? "",

        accountNumber: user.bankDetails?.accountNumber ?? "",

        ifscCode: user.bankDetails?.ifscCode ?? "",

        bankName: user.bankDetails?.bankName ?? "",
      },
      googleMapLink: user.googleMapLink ?? "",
    });
  }, [user]);

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
    mutationFn: doctorUpdateProfile,
    onSuccess: (res) => {
      // Update user in Zustand store
      useAuthStore
        .getState()
        .setAuth(res.data.doctor, useAuthStore.getState().token, "doctor");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const TABS = [
    { id: "profile", label: "Profile & Fees" },
    { id: "schedule", label: "Schedule" },
    { id: "address", label: "Address" },
    { id: "bank", label: "Bank Details" },
  ];

  return (
    <div className="">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile Management</h1>
        <p className="text-sm text-gray-400 mt-1">
          Update your professional details
        </p>
      </div>

      {/* Doctor info card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 mb-5">
        <div className="w-14 h-14 rounded-2xl bg-teal-100 flex items-center justify-center text-lg font-bold text-primary shrink-0">
          {user?.name
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </div>
        <div>
          <p className="text-base font-bold text-gray-900">{user?.name}</p>
          <p className="text-sm text-gray-400">{user?.email}</p>
          {user?.speciality && (
            <span className="text-xs font-semibold text-primary bg-teal-50 px-2 py-0.5 rounded-full mt-1 inline-block">
              {user.speciality}
            </span>
          )}
        </div>
        <div className="ml-auto text-right">
          <p className="text-xs text-gray-400">Degree</p>
          <p className="text-sm font-semibold text-gray-700">
            {user?.degree || "—"}
          </p>
          <p className="text-xs text-gray-400 mt-1">Experience</p>
          <p className="text-sm font-semibold text-gray-700">
            {user?.experience || "—"}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={clsx(
              "px-4 py-2 text-xs font-semibold rounded-lg transition-colors",
              tab === id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        {/* ── Profile & Fees ── */}
        {tab === "profile" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
              <div className="flex items-end">
                <Toggle
                  label="Available for Appointments"
                  checked={form.availabilityStatus}
                  onChange={(v) => set("availabilityStatus", v)}
                />
              </div>
            </div>
            <Field label="Description">
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Brief about yourself, expertise, approach..."
                rows={4}
                className={clsx(inputCls, "resize-none")}
              />
            </Field>
          </div>
        )}

        {/* ── Schedule ── */}
        {tab === "schedule" && (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-4">
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
                  Working days: {form.availableDays.join(", ")}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Address ── */}
        {tab === "address" && (
          <div className="grid grid-cols-2 gap-4">
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
        {tab === "bank" && (
          <div className="grid grid-cols-2 gap-4">
            <Field label="Account Holder Name">
              <input
                value={form.bankDetails.accountHolderName}
                onChange={(e) => setBank("accountHolderName", e.target.value)}
                placeholder="Dr. John Smith"
                className={inputCls}
              />
            </Field>

            <Field label="Account Number">
              <input
                value={form.bankDetails.accountNumber}
                onChange={(e) => setBank("accountNumber", e.target.value)}
                placeholder="1234567890"
                className={inputCls}
              />
            </Field>

            <Field label="IFSC Code">
              <input
                value={form.bankDetails.ifscCode}
                onChange={(e) => setBank("ifscCode", e.target.value)}
                placeholder="SBIN0001234"
                className={inputCls}
              />
            </Field>

            <Field label="Bank Name">
              <input
                value={form.bankDetails.bankName}
                onChange={(e) => setBank("bankName", e.target.value)}
                placeholder="State bank of india"
                className={inputCls}
              />
            </Field>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="mt-4 text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            {error?.response?.data?.message || "Update failed."}
          </p>
        )}

        {/* Success */}
        {saved && (
          <p className="mt-4 text-sm text-primary bg-teal-50 border border-teal-200 rounded-xl px-3 py-2">
            ✓ Profile updated successfully!
          </p>
        )}

        {/* Save button */}
        <div className="flex justify-end mt-6">
          <button
            onClick={() => mutate(form)}
            disabled={isPending}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl transition-colors disabled:opacity-60"
          >
            {isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
