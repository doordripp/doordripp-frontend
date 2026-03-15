import React from 'react'
import { Outlet } from 'react-router-dom'
import ManagerSidebar from '../components/Manager/ManagerSidebar'
import PanelHeader from '../components/Panel/PanelHeader'

export default function ManagerLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <ManagerSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <PanelHeader title="Manager Panel" subtitle="Manage store & deliveries" />
        <main className="p-4 sm:p-6 flex-1 overflow-x-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
