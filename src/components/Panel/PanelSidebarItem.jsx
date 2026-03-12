import React from 'react'
import { NavLink } from 'react-router-dom'

export default function PanelSidebarItem({ to, icon: Icon, children }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
          isActive
            ? 'bg-black text-white shadow-sm'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`
      }
    >
      {Icon && <Icon size={18} />}
      {children}
    </NavLink>
  )
}
