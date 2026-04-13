import { Outlet } from "react-router-dom";
import DoctorSidebar from "./DoctorSidebar";
import DoctorNavbar from "./DoctorNavbar";

export default function DoctorLayout() {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <DoctorSidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <DoctorNavbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}