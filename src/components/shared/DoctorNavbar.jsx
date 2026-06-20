import { Bell, Settings, Plus, Menu } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { getImageUrl } from "../../utils/getImageUrl";

function getFormattedDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
}

// `onMenuClick` opens the sidebar drawer on small/medium screens.
// The button itself is hidden at `lg`+, where the sidebar is static.
export default function DoctorNavbar({ onMenuClick = () => {} }) {
  const { user } = useAuthStore();

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "DR";

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center px-3 sm:px-5 gap-2 sm:gap-3 shrink-0">
      {/* Hamburger — mobile / tablet only */}
      <button
        onClick={onMenuClick}
        className="lg:hidden w-8 h-8 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0 hover:bg-teal-50 hover:border-teal-200 transition-colors"
      >
        <Menu size={16} className="text-gray-600" />
      </button>

      {/* Right side */}
      <div className="flex items-center gap-2 ml-auto">
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl whitespace-nowrap">
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
          <span className="text-xs font-medium text-gray-700">
            {getFormattedDate()}
          </span>
        </div>

        {/* Profile chip — name/specialty collapse to just the avatar on mobile */}
        <div className="flex items-center gap-2 px-2 sm:px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-teal-50 hover:border-teal-200 transition-colors">
          <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
            {user?.image ? (
              <img
                src={getImageUrl(user?.image)}
                alt={user?.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-primary">
                {initials}
              </div>
            )}
          </div>
          <div className=" sm:block min-w-0">
            <p className="text-xs font-semibold text-gray-900 leading-none truncate">
              {user?.name || "Doctor"}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5 truncate">
              {user?.speciality || "Specialist"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
