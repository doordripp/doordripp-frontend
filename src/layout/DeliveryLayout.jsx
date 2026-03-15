import React from 'react'
import { Outlet } from 'react-router-dom'
import DeliverySidebar from '../components/Delivery/DeliverySidebar'
import PanelHeader from '../components/Panel/PanelHeader'

export default function DeliveryLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <DeliverySidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <PanelHeader title="Delivery Panel" subtitle="Manage your deliveries" />
        <main className="p-4 sm:p-6 flex-1 overflow-x-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
