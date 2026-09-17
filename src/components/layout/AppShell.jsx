import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet } from "react-router-dom";

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="bg-[#f0f4fa] text-[#111827] min-h-screen" style={{ fontFamily: "'Inter', 'Hanken Grotesk', sans-serif" }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* content offset — only on lg+ where sidebar is always visible */}
      <div className="lg:pl-[220px]">
        <Header onMenuToggle={() => setSidebarOpen((o) => !o)} />
        <main className="pt-14 min-h-screen bg-[#f0f4fa]">
          <div className="w-full px-4 md:px-6 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
