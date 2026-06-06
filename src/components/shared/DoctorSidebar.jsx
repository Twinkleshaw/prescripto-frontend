import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  DollarSign,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import logo from "../../assets/logo.png";
import clsx from "clsx";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/doctor/dashboard" },
  { label: "Appointment", icon: CalendarDays, to: "/doctor/appointments" },
  { label: "Payment", icon: DollarSign, to: "/doctor/payments" },
  { label: "Settings", icon: Settings, to: "/doctor/settings" },
];

export default function DoctorSidebar() {
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
      .toUpperCase() || "DR";

  return (
    <aside className="w-52 bg-white border-r border-gray-100 flex flex-col shrink-0 h-screen">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-gray-100">
        <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shrink-0">
          <img src={logo} alt="logo" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900 leading-none">
            Prescripto
          </p>
          <p className="text-[10px] text-gray-400 tracking-wide mt-0.5">
            DOCTOR ADMIN
          </p>
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

      {/* Doctor profile footer */}
      <div className="px-2.5 py-3 border-t border-gray-100">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-50 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-xs font-bold text-primary shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-900 truncate">
              {user?.name || "Doctor"}
            </p>
            <p className="text-[10px] text-gray-400 truncate">
              {user?.specialization || "Specialist"}
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
  );
}
