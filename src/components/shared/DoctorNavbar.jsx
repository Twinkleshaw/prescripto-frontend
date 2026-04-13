import { Bell, Settings, Plus } from "lucide-react";
import { useAuthStore } from "../../store/authStore";

function getFormattedDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
}

export default function DoctorNavbar() {
  const { user } = useAuthStore();

  const initials = user?.name
    ?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "DR";

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center px-5 gap-3 shrink-0">
      {/* Search */}
      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 w-60">
        <svg
          className="w-3.5 h-3.5 stroke-gray-400 fill-none shrink-0"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search patients, records..."
          className="bg-transparent text-xs text-gray-600 outline-none w-full placeholder:text-gray-400"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Bell */}
        <button className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-teal-50 hover:border-teal-200 transition-colors">
          <Bell size={15} className="text-gray-500" />
        </button>

        {/* Settings */}
        <button className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-teal-50 hover:border-teal-200 transition-colors">
          <Settings size={15} className="text-gray-500" />
        </button>

        {/* Date chip */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl">
          <svg
            className="w-3.5 h-3.5 fill-none shrink-0"
            viewBox="0 0 24 24"
            stroke="#0d9488"
            strokeWidth="2"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span className="text-xs font-medium text-gray-700">{getFormattedDate()}</span>
        </div>

        {/* Profile chip */}
        <div className="flex items-center gap-2 px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-teal-50 hover:border-teal-200 transition-colors">
          <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-900 leading-none">{user?.name || "Doctor"}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{user?.specialization || "Specialist"}</p>
          </div>
        </div>

        {/* FAB — quick action */}
        <button className="w-9 h-9 rounded-full bg-primary flex items-center justify-center hover:bg-primary-dark transition-colors shadow-sm">
          <Plus size={18} className="text-white" strokeWidth={2.5} />
        </button>
      </div>
    </header>
  );
}