import React, { useState, useEffect } from 'react'
import { 
  Users, Search, Filter, MoreVertical, Shield, Ban, 
  CheckCircle, Lock, Unlock, MapPin, ChevronDown, X, Eye
} from 'lucide-react'
import { apiGet, apiPost, apiPut } from '../../services/apiClient'
import { toast } from 'react-hot-toast'
import UserDetailsModal from './UserDetailsModal'
import RoleChangeModal from './RoleChangeModal'
import BanUserModal from './BanUserModal'
import AreaManagerModal from './AreaManagerModal'

export default function AdminUsersEnhanced() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [total, setTotal] = useState(0)

  // Modals
  const [selectedUser, setSelectedUser] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [showBanModal, setShowBanModal] = useState(false)
  const [showAreaModal, setShowAreaModal] = useState(false)

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        search: searchTerm,
        role: roleFilter,
        status: statusFilter,
        page,
        limit
      })

      const response = await apiGet(`/admin/users?${params}`)
      setUsers(response.users || [])
      setTotal(response.pagination?.total || 0)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [searchTerm, roleFilter, statusFilter, page])

  // Handle ban user
  const handleBanUser = async (userId, reason) => {
    try {
      await apiPost(`/admin/users/${userId}/ban`, { reason })
      toast.success('User banned successfully')
      setShowBanModal(false)
      fetchUsers()
    } catch (error) {
      toast.error(error?.message || 'Failed to ban user')
    }
  }

  // Handle unban user
  const handleUnbanUser = async (userId) => {
    try {
      await apiPost(`/admin/users/${userId}/unban`, {})
      toast.success('User unbanned successfully')
      fetchUsers()
    } catch (error) {
      toast.error(error?.message || 'Failed to unban user')
    }
  }

  // Handle role change
  const handleChangeRole = async (userId, roles) => {
    try {
      await apiPut(`/admin/users/${userId}/role`, { roles })
      toast.success('User role updated successfully')
      setShowRoleModal(false)
      fetchUsers()
    } catch (error) {
      toast.error(error?.message || 'Failed to update role')
    }
  }

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-700',
      manager: 'bg-blue-100 text-blue-700',
      customer: 'bg-gray-100 text-gray-700'
    }
    return colors[role] || 'bg-gray-100 text-gray-700'
  }

  const getStatusBadgeColor = (user) => {
    if (user.isBanned) return 'bg-red-100 text-red-700'
    return 'bg-green-100 text-green-700'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="h-8 w-8" />
            User Management
          </h1>
          <p className="text-gray-600 mt-2">Manage user roles, ban/unban users, and assign managers</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, phone..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setPage(1)
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            {/* Role Filter */}
            <div>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value)
                  setPage(1)
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="customer">Customer</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPage(1)
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="banned">Banned</option>
              </select>
            </div>

            {/* Total */}
            <div className="flex items-center justify-end">
              <p className="text-sm text-gray-600">
                Total: <span className="font-semibold">{total}</span> users
              </p>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No users found</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Roles
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium">
                              {user.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-3">
                              <p className="font-medium text-gray-900">{user.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-2">
                            {user.roles?.map((role) => (
                              <span
                                key={role}
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                                  role
                                )}`}
                              >
                                {role.charAt(0).toUpperCase() + role.slice(1)}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                              user
                            )}`}
                          >
                            {user.isBanned ? '🚫 Banned' : '✓ Active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedUser(user)
                                setShowDetailsModal(true)
                              }}
                              className="p-2 hover:bg-gray-100 rounded-lg transition"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4 text-gray-600" />
                            </button>

                            <button
                              onClick={() => {
                                setSelectedUser(user)
                                setShowRoleModal(true)
                              }}
                              className="p-2 hover:bg-gray-100 rounded-lg transition"
                              title="Change Role"
                            >
                              <Shield className="h-4 w-4 text-blue-600" />
                            </button>

                            {user.roles?.includes('manager') && (
                              <button
                                onClick={() => {
                                  setSelectedUser(user)
                                  setShowAreaModal(true)
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg transition"
                                title="Assign Areas"
                              >
                                <MapPin className="h-4 w-4 text-green-600" />
                              </button>
                            )}

                            {user.isBanned ? (
                              <button
                                onClick={() => handleUnbanUser(user._id)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition"
                                title="Unban User"
                              >
                                <Unlock className="h-4 w-4 text-green-600" />
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedUser(user)
                                  setShowBanModal(true)
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg transition"
                                title="Ban User"
                              >
                                <Ban className="h-4 w-4 text-red-600" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page * limit >= total}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedUser && showDetailsModal && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setShowDetailsModal(false)}
        />
      )}

      {selectedUser && showRoleModal && (
        <RoleChangeModal
          user={selectedUser}
          onSubmit={handleChangeRole}
          onClose={() => setShowRoleModal(false)}
        />
      )}

      {selectedUser && showBanModal && (
        <BanUserModal
          user={selectedUser}
          onSubmit={handleBanUser}
          onClose={() => setShowBanModal(false)}
        />
      )}

      {selectedUser && showAreaModal && (
        <AreaManagerModal
          user={selectedUser}
          onClose={() => setShowAreaModal(false)}
          onSuccess={fetchUsers}
        />
      )}
    </div>
  )
}
