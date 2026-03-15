import React, { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import ManagerSidebar from '../components/Manager/ManagerSidebar'
import PanelHeader from '../components/Panel/PanelHeader'

export default function ManagerLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  return (
    <div className="flex min-h-screen bg-gray-50 relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - fixed on mobile, static on desktop */}
      <div className={`fixed inset-y-0 left-0 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-200 ease-in-out md:block`}>
        <ManagerSidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <PanelHeader title="Manager Panel" subtitle="Manage store & deliveries" onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="p-4 sm:p-6 flex-1 overflow-x-hidden overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
