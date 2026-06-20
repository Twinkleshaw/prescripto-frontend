import { Bell, HelpCircle, Menu } from "lucide-react";

// `onMenuClick` opens the sidebar drawer on small/medium screens.
// The button itself is hidden at `lg`+, where the sidebar is static.
export default function AdminNavbar({ onMenuClick = () => {} }) {
  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center px-3 sm:px-5 gap-3 sm:gap-4 shrink-0">
      {/* Hamburger — mobile / tablet only */}
      <button
        onClick={onMenuClick}
        className="lg:hidden w-8 h-8 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0 hover:bg-teal-50 hover:border-teal-200 transition-colors"
      >
        <Menu size={16} className="text-gray-600" />
      </button>

      {/* Page label */}
      <span className="text-sm font-bold text-gray-900 shrink-0 truncate">
        Clinical Curator
      </span>

      <div className="flex items-center gap-2 ml-auto"></div>
    </header>
  );
}
