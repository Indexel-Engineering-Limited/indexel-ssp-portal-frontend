import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet } from "react-router-dom";

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell min-h-screen">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* content offset — tablet rail and expanded desktop sidebar */}
      <div className="md:pl-[72px] lg:pl-[220px]">
        <Header onMenuToggle={() => setSidebarOpen((o) => !o)} />
        <main className="app-main min-h-screen pt-14">
          <div className="w-full px-4 py-6 md:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
