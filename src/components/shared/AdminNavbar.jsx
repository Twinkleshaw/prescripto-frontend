import { Bell, HelpCircle } from "lucide-react";
import { useAuthStore } from "../../store/authStore";

export default function AdminNavbar() {
  const { user } = useAuthStore();

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AD";

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center px-5 gap-4 shrink-0">
      {/* Page label */}
      <span className="text-sm font-bold text-gray-900 shrink-0">
        Clinical Curator
      </span>

      {/* Search */}
      {/* <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 w-64">
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
          placeholder="Search patient or doctor..."
          className="bg-transparent text-xs text-gray-600 outline-none w-full placeholder:text-gray-400"
        />
      </div> */}

      {/* Right icons */}
      <div className="flex items-center gap-2 ml-auto">
        <button className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-teal-50 hover:border-teal-200 transition-colors">
          <Bell size={15} className="text-gray-500" />
        </button>
        <button className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-teal-50 hover:border-teal-200 transition-colors">
          <HelpCircle size={15} className="text-gray-500" />
        </button>

        {/* Profile chip */}
        <div className="flex items-center gap-2 px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-teal-50 hover:border-teal-200 transition-colors">
          <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-900 leading-none">
              Vitalis Pro
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">Super Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}
