import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import MobileBottomNav from "@/components/MobileBottomNav";

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-app transition-colors duration-200">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar with mobile class toggle */}
      <div
        className={`fixed inset-y-0 left-0 z-30 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:relative md:w-64 md:flex-shrink-0 md:sticky md:top-0 md:h-screen bottom-16 md:bottom-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar />
      </div>

      <main className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
        {/* Mobile Header - Keeping simplified for Logo, or removing if strictly bottom-only. 
            User said "header should be in bottom", likely meaning Nav. 
            Let's keep a minimal top bar for Logo/Status but make it very subtle or part of content.
            Actually, let's keep MobileHeader for the Logo/Sidebar trigger if needed, BUT user wants bottom approach.
            Let's hide MobileHeader and rely on BottomNav + Drawer.
        */}

        <Outlet />
      </main>

      <MobileBottomNav onMenuClick={() => setIsSidebarOpen(true)} />
    </div>
  );
};

export default Layout;
