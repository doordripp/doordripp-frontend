import React from 'react'
import { Outlet } from 'react-router-dom'
import ManagerSidebar from '../components/Manager/ManagerSidebar'
import PanelHeader from '../components/Panel/PanelHeader'

export default function ManagerLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <ManagerSidebar />
      <div className="flex-1 flex flex-col">
        <PanelHeader title="Manager Panel" subtitle="Manage store & deliveries" />
        <main className="p-6 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
