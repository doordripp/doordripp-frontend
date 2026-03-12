import React from 'react'
import { Link } from 'react-router-dom'
import PanelSidebarItem from '../Panel/PanelSidebarItem'
import PanelSidebarSection from '../Panel/PanelSidebarSection'
import {
  LayoutDashboard,
  ShoppingCart,
  CalendarClock
} from 'lucide-react'

export default function DeliverySidebar() {
  return (
    <aside className="w-64 bg-white min-h-screen border-r border-gray-200 p-4 flex flex-col">
      <div className="mb-6 px-2">
        <div className="text-xl font-bold text-gray-900">DoorDrip</div>
        <div className="text-xs text-gray-500 mt-0.5 font-medium">Delivery Panel</div>
      </div>

      <nav className="flex flex-col gap-0.5 flex-1">
        <PanelSidebarItem to="/delivery" icon={LayoutDashboard}>Dashboard</PanelSidebarItem>

        <PanelSidebarSection title="Deliveries">
          <PanelSidebarItem to="/delivery/orders" icon={ShoppingCart}>My Deliveries</PanelSidebarItem>
          <PanelSidebarItem to="/delivery/schedule" icon={CalendarClock}>Schedule</PanelSidebarItem>
        </PanelSidebarSection>
      </nav>

      <div className="mt-auto pt-4 border-t border-gray-200">
        <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-gray-900 transition">
          ← Back to Profile
        </Link>
      </div>
    </aside>
  )
}
