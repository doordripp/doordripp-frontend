import React from 'react'
import { Outlet } from 'react-router-dom'
import DeliverySidebar from '../components/Delivery/DeliverySidebar'
import PanelHeader from '../components/Panel/PanelHeader'

export default function DeliveryLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <DeliverySidebar />
      <div className="flex-1 flex flex-col">
        <PanelHeader title="Delivery Panel" subtitle="Manage your deliveries" />
        <main className="p-6 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
