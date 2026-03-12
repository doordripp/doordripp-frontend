import React from 'react'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'
import { LogOut, User, ArrowLeft } from 'lucide-react'

export default function PanelHeader({ title = 'Panel', subtitle }) {
  const { user, logout } = useAuth()

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <Link
          to="/profile"
          className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-500 hover:text-gray-900"
          title="Back to Profile"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <User size={16} className="text-gray-400" />
          <span className="font-medium">{user?.name || 'User'}</span>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-black transition"
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </header>
  )
}
