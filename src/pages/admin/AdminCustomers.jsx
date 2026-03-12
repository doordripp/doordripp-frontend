import React, { useEffect, useState } from 'react'
import adminAPI from '../../services/adminAPI'
import { Search, Users } from 'lucide-react'
import { getDisplayRoles } from './userRolesConfig'

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    adminAPI.getAllUsers({ search: searchTerm || undefined, role: 'customer' })
      .then(data => {
        const users = data.users || data || []
        setCustomers(Array.isArray(users) ? users : [])
      })
      .catch(() => setCustomers([]))
      .finally(() => setLoading(false))
  }, [searchTerm])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users size={24} className="text-gray-700" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500 text-sm">View all registered customers</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, email or phone..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-black outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Name</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Email</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Phone</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Roles</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Joined</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400">Loading customers...</td></tr>
            ) : customers.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400">No customers found</td></tr>
            ) : (
              customers.map(c => (
                <tr key={c._id || c.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-gray-900">{c.name}</td>
                  <td className="px-5 py-3.5 text-gray-600">{c.email}</td>
                  <td className="px-5 py-3.5 text-gray-600">{c.phone || '—'}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {getDisplayRoles(c.roles || []).map(r => (
                        <span key={r} className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded font-medium">{r.replace('_', ' ')}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 text-xs">
                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      c.isBanned || c.blocked
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {c.isBanned || c.blocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
