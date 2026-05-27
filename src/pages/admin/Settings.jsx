import { useState, useRef, useEffect } from "react";
import {
  User,
  Phone,
  Mail,
  Lock,
  Camera,
  Eye,
  EyeOff,
  CheckCircle2,
  Check,
  Minus,
} from "lucide-react";
import clsx from "clsx";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../../store/authStore";
import {
  changePasswordApi,
  updateAdminProfileApi,
} from "../../api/endpoints/auth";

// ── helpers ──────────────────────────────────────────────
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const inputWrap =
  "flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus-within:border-primary focus-within:bg-white transition-colors";
const inputInner =
  "border-none bg-transparent text-sm text-gray-700 outline-none w-full placeholder:text-gray-400";

// ── Profile completeness checker ──────────────────────────
function getCompleteness(user, role) {
  const checks = [
    { label: "Name added", done: !!user?.name },
    { label: "Email verified", done: !!user?.email },
    { label: "Phone added", done: !!user?.phone },
    { label: "Profile photo", done: !!user?.image },
    ...(role === "doctor"
      ? [
          { label: "Speciality set", done: !!user?.speciality },
          { label: "Fees configured", done: !!user?.fees },
          { label: "Schedule set", done: !!user?.startTime },
        ]
      : []),
  ];
  const done = checks.filter((c) => c.done).length;
  const pct = Math.round((done / checks.length) * 100);
  return { checks, pct };
}

// ── Right panel ───────────────────────────────────────────
function RightPanel({ user, role }) {
  const { checks, pct } = getCompleteness(user, role);

  return (
    <div className="flex flex-col gap-4">
      {/* Account info */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
          Account Info
        </p>
        <div className="divide-y divide-gray-50">
          <div className="flex items-center justify-between py-2.5">
            <span className="text-xs text-gray-400">Role</span>
            <span className="text-[10px] font-bold px-2.5 py-0.5 bg-teal-50 text-primary rounded-full capitalize">
              {role}
            </span>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <span className="text-xs text-gray-400">Account ID</span>
            <span className="text-[10px] font-mono text-gray-500">
              {user?._id?.slice(0, 6)}...{user?._id?.slice(-4)}
            </span>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <span className="text-xs text-gray-400">Last Update</span>
            <span className="text-xs font-semibold text-gray-800">
              {fmtDate(user?.updatedAt) ?? "No updates yet"}
            </span>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <span className="text-xs text-gray-400">Status</span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-primary">
              <span className="w-1.5 h-1.5 bg-primary rounded-full" />
              Active
            </span>
          </div>
          {role === "doctor" && user?.speciality && (
            <div className="flex items-center justify-between py-2.5">
              <span className="text-xs text-gray-400">Speciality</span>
              <span className="text-xs font-semibold text-gray-800">
                {user.speciality}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Profile completeness */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
          Profile Completeness
        </p>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between mb-1.5">
            <span className="text-xs text-gray-600 font-medium">Overall</span>
            <span className="text-xs font-bold text-primary">{pct}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full">
            <div
              className="h-1.5 bg-primary rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Checklist */}
        <div className="space-y-1.5">
          {checks.map(({ label, done }) => (
            <div key={label} className="flex items-center gap-2.5">
              <div
                className={clsx(
                  "w-4 h-4 rounded-full flex items-center justify-center shrink-0",
                  done ? "bg-primary" : "bg-gray-100",
                )}
              >
                {done ? (
                  <Check size={9} className="text-white" strokeWidth={3} />
                ) : (
                  <Minus size={9} className="text-gray-400" strokeWidth={2} />
                )}
              </div>
              <span
                className={clsx(
                  "text-xs",
                  done ? "text-gray-700 font-medium" : "text-gray-400",
                )}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Nudge if incomplete */}
        {pct < 100 && (
          <p className="text-[10px] text-gray-400 mt-3 pt-3 border-t border-gray-100">
            Complete your profile to improve visibility to patients.
          </p>
        )}
      </div>
    </div>
  );
}

// ── Main Settings Page ────────────────────────────────────
export default function Settings() {
  const { user, role, setAuth, token } = useAuthStore();

  // Profile form
  const [profile, setProfile] = useState({
    name: user?.name ?? "",
    phone: user?.phone ?? "",
  });

  const [avatarPreview, setAvatarPreview] = useState(
    user?.profileImage ?? null,
  );
  const [avatarFile, setAvatarFile] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    setProfile({ name: user?.name ?? "", phone: user?.phone ?? "" });
    setAvatarPreview(user?.profileImage ?? null);
  }, [user]);

  const { mutate: updateProfile, isPending: updatingProfile } = useMutation({
    mutationFn: updateAdminProfileApi,

    onSuccess: (res) => {
      setAuth(res.data.admin, token, role);

      setProfileSuccess(true);

      setTimeout(() => {
        setProfileSuccess(false);
      }, 3000);
    },

    onError: (err) => {
      alert(err?.response?.data?.message || "Failed to update profile.");
    },
  });

  // Password form
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // ── Password mutation ───────────────────────────────────
  const { mutate: changePassword, isPending: changingPw } = useMutation({
    mutationFn: changePasswordApi,
    onSuccess: () => {
      setPwSuccess(true);
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setPwSuccess(false), 3000);
    },
    onError: (err) =>
      setPwError(err?.response?.data?.message || "Failed to change password."),
  });

  // ── Handlers ────────────────────────────────────────────
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Max 5MB.");
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleProfileSave = () => {
    updateProfile({
      name: profile.name,
      phone: profile.phone,
      profileImage: avatarPreview,
    });
  };

  const handlePasswordSave = () => {
    setPwError("");

    changePassword({
      oldPassword: passwords.oldPassword,
      newPassword: passwords.newPassword,
      confirmPassword: passwords.confirmPassword,
    });
  };

  const handleSaveAll = () => {
    // 🔥 Check profile changes
    const profileChanged =
      profile.name !== user?.name ||
      profile.phone !== user?.phone ||
      avatarFile !== user?.image;

    const passwordEntered =
      passwords.oldPassword ||
      passwords.newPassword ||
      passwords.confirmPassword;

    if (profileChanged) {
      updateProfile({
        name: profile.name,
        phone: profile.phone,
        profileImage: avatarPreview,
      });
    }

    if (passwordEntered) {
      handlePasswordSave();
    }

    if (!profileChanged && !passwordEntered) {
      alert("No changes made.");
    }
  };

  const handleCancel = () => {
    setProfile({ name: user?.name ?? "", phone: user?.phone ?? "" });
    setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
    setPwError("");
    setAvatarPreview(user?.image ?? null);
    setAvatarFile(null);
  };

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AD";
  const cardTitle =
    role === "admin" ? "Admin Profile Details" : "Doctor Profile Details";

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-sm text-gray-400 mt-1">
          Manage your professional credentials and clinical environment
          preferences.
        </p>
      </div>

      <div className="grid grid-cols-[1fr_350px] gap-10 items-start">
        {/* ── LEFT column ── */}
        <div className=" ">
          {/* Profile card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center">
                <User size={16} className="text-primary" />
              </div>
              <h2 className="text-sm font-bold text-gray-900">{cardTitle}</h2>
            </div>

            {/* Avatar */}
            <div className="flex items-center gap-4 mb-5">
              <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                  {/* {avatarPreview ? ( */}
                  <img
                    src={user?.profileImage}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                  {/* ) : ( */}
                  {/* <span className="text-lg font-bold text-primary">
                    {initials}
                  </span> */}
                  {/* )} */}
                </div>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="absolute bottom-0 right-0 w-5 h-5 bg-primary rounded-full flex items-center justify-center border-2 border-white"
                >
                  <Camera size={9} className="text-white" />
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Profile Photo
                </p>
                <p className="text-xs text-gray-400 mb-2">
                  JPG or PNG. Max size 5MB.
                </p>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Change photo
                </button>
              </div>
            </div>

            {/* Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Full name
                </label>
                <div className={inputWrap}>
                  <User size={14} className="text-gray-400 shrink-0" />
                  <input
                    value={profile.name}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, name: e.target.value }))
                    }
                    placeholder="Your name"
                    className={inputInner}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Phone number
                </label>
                <div className={inputWrap}>
                  <Phone size={14} className="text-gray-400 shrink-0" />
                  <input
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, phone: e.target.value }))
                    }
                    placeholder="+91 9876543210"
                    className={inputInner}
                  />
                </div>
              </div>

              {/* Email — read only */}
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Email address
                </label>
                <div
                  className={clsx(inputWrap, "opacity-70 cursor-not-allowed")}
                >
                  <Mail size={14} className="text-gray-400 shrink-0" />
                  <input
                    value={user?.email ?? ""}
                    disabled
                    className={clsx(inputInner, "cursor-not-allowed")}
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  Email address cannot be changed.
                </p>
              </div>
            </div>

            {profileSuccess && (
              <div className="flex items-center gap-2 mt-3 text-xs text-primary bg-teal-50 border border-teal-200 rounded-xl px-3 py-2">
                <CheckCircle2 size={13} /> Profile updated successfully!
              </div>
            )}
          </div>

          {/* Password card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-5">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center">
                <Lock size={16} className="text-primary" />
              </div>
              <h2 className="text-sm font-bold text-gray-900">
                Change password
              </h2>
            </div>

            <div className="space-y-3">
              {/* Old */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Old Password
                </label>
                <div className={clsx(inputWrap, "relative")}>
                  <Lock size={14} className="text-gray-400 shrink-0" />
                  <input
                    type={showOld ? "text" : "password"}
                    value={passwords.oldPassword}
                    onChange={(e) =>
                      setPasswords((p) => ({
                        ...p,
                        oldPassword: e.target.value,
                      }))
                    }
                    placeholder="Current password"
                    className={clsx(inputInner, "pr-8")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowOld(!showOld)}
                    className="absolute right-3 text-gray-400 hover:text-gray-600"
                  >
                    {showOld ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* New + Confirm */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    New Password
                  </label>
                  <div className={clsx(inputWrap, "relative")}>
                    <Lock size={14} className="text-gray-400 shrink-0" />
                    <input
                      type={showNew ? "text" : "password"}
                      value={passwords.newPassword}
                      onChange={(e) =>
                        setPasswords((p) => ({
                          ...p,
                          newPassword: e.target.value,
                        }))
                      }
                      placeholder="New password"
                      className={clsx(inputInner, "pr-8")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 text-gray-400 hover:text-gray-600"
                    >
                      {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Confirm Password
                  </label>
                  <div className={clsx(inputWrap, "relative")}>
                    <Lock size={14} className="text-gray-400 shrink-0" />
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={passwords.confirmPassword}
                      onChange={(e) =>
                        setPasswords((p) => ({
                          ...p,
                          confirmPassword: e.target.value,
                        }))
                      }
                      placeholder="Confirm password"
                      className={clsx(inputInner, "pr-8")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Security box */}
              <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-3">
                <p className="flex items-center gap-1.5 text-[10px] font-bold text-primary tracking-widest uppercase mb-2">
                  <svg
                    className="w-3 h-3 stroke-primary fill-none"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  Security Requirements
                </p>
                <ul className="space-y-1">
                  {[
                    "Minimum 12 characters",
                    "At least one special character",
                    "Must not match previous 3 passwords",
                  ].map((r) => (
                    <li
                      key={r}
                      className="flex items-center gap-2 text-xs text-gray-600"
                    >
                      <span className="w-1 h-1 rounded-full bg-primary shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              {pwError && (
                <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                  {pwError}
                </p>
              )}
              {pwSuccess && (
                <div className="flex items-center gap-2 text-xs text-primary bg-teal-50 border border-teal-200 rounded-xl px-3 py-2">
                  <CheckCircle2 size={13} /> Password changed successfully!
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={handleCancel}
              className="px-5 py-2.5 text-sm font-semibold text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAll}
              disabled={changingPw || updatingProfile}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl flex items-center gap-2 transition-colors disabled:opacity-60"
            >
              {changingPw || updatingProfile ? "Saving..." : "Save Changes"}
              {!changingPw && <CheckCircle2 size={14} />}
            </button>
          </div>
        </div>

        {/* ── RIGHT column ── */}
        <RightPanel user={user} role={role} />
      </div>
    </div>
  );
}
