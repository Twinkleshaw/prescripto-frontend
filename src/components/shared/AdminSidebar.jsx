import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, UserRound, CalendarDays,
  DollarSign, FileText, BarChart2, Settings, LogOut
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import clsx from "clsx";

const navItems = [
  { label: "Dashboard",    icon: LayoutDashboard, to: "/admin/dashboard" },
  { label: "Doctors",      icon: Users,           to: "/admin/doctors" },
  { label: "Patients",     icon: UserRound,       to: "/admin/patients" },
  { label: "Appointments", icon: CalendarDays,    to: "/admin/appointments" },
  { label: "Financials",   icon: DollarSign,      to: "/admin/financials" },
  { label: "Invoices",     icon: FileText,        to: "/admin/invoices" },
  { label: "Reports",      icon: BarChart2,       to: "/admin/reports" },
  { label: "Settings",     icon: Settings,        to: "/admin/settings" },
];

export default function AdminSidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user?.name
    ?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "AD";

  return (
    <aside className="w-56 bg-white border-r border-gray-100 flex flex-col shrink-0 h-screen">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-gray-100">
        <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
            <path d="M19 9h-1V7a6 6 0 00-12 0v2H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2v-9a2 2 0 00-2-2zm-7 8a2 2 0 110-4 2 2 0 010 4zm3-8H9V7a3 3 0 016 0v2z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900 leading-none">Prescripto</p>
          <p className="text-[10px] text-gray-400 tracking-wide mt-0.5">MEDICAL GROUP</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                isActive
                  ? "bg-teal-50 text-primary font-semibold"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={16} className={isActive ? "text-primary" : "text-gray-400"} />
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
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-900 truncate">{user?.name || "Admin"}</p>
            <p className="text-[10px] text-gray-400 truncate">{user?.email || "Chief Administrator"}</p>
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
  );
}