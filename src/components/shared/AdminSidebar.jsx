import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserRound,
  CalendarDays,
  DollarSign,
  FileText,
  BarChart2,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import logo from "../../assets/logo.png";
import clsx from "clsx";
import { getImageUrl } from "../../utils/getImageUrl";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/admin/dashboard" },
  { label: "Doctors", icon: Users, to: "/admin/doctors" },
  { label: "Patients", icon: UserRound, to: "/admin/patients" },
  { label: "Appointments", icon: CalendarDays, to: "/admin/appointments" },
  { label: "Financials", icon: DollarSign, to: "/admin/financials" },
  { label: "Invoices", icon: FileText, to: "/admin/invoices" },
  // { label: "Reports",      icon: BarChart2,       to: "/admin/reports" },
  { label: "Settings", icon: Settings, to: "/admin/settings" },
];

// `open` / `onClose` only matter below the `lg` breakpoint, where the
// sidebar becomes an off-canvas drawer. At `lg`+ it's always visible
// and these props are ignored.
export default function AdminSidebar({ open = false, onClose = () => {} }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AD";

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}

      <aside
        className={clsx(
          "w-64 sm:w-56 bg-white border-r border-gray-100 flex flex-col shrink-0 h-screen",
          "fixed inset-y-0 left-0 z-50 transition-transform duration-200 ease-out",
          "lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-gray-100">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shrink-0">
            <img src={logo} alt="" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 leading-none">
              Prescripto
            </p>
            <p className="text-[10px] text-gray-400 tracking-wide mt-0.5">
              MEDICAL GROUP
            </p>
          </div>

          {/* Close — mobile drawer only */}
          <button
            onClick={onClose}
            className="ml-auto w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 lg:hidden shrink-0"
          >
            <X size={15} className="text-gray-500" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ label, icon: Icon, to }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  isActive
                    ? "bg-teal-50 text-primary font-semibold"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={16}
                    className={isActive ? "text-primary" : "text-gray-400"}
                  />
                  <span>{label}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="px-2.5 py-3 border-t border-gray-100">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-50 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-xs font-bold text-primary shrink-0">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-teal-100 shrink-0">
                {user?.profileImage ? (
                  <img
                    src={getImageUrl(user.profileImage)}
                    alt={user?.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-primary">
                    {initials}
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">
                {user?.name || "Admin"}
              </p>
              <p className="text-[10px] text-gray-400 truncate">
                {user?.email || "Chief Administrator"}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full mt-1 flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
