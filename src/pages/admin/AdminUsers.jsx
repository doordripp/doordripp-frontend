import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, Navigate } from 'react-router-dom'
import { Search, Filter, Edit, Trash2, Shield, User, X, Mail, CircleOff } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { AdminTable } from '../../components/ui'
import adminAPI from '../../services/adminAPI'
import { useAuth } from '../../context/AuthContext'
import { hasDeliveryPartnerAccess } from '../../utils/roleUtils'
import { usePanelBase } from '../../hooks/usePanelBase'
import RoleChangeModal from './RoleChangeModal'
import { MANAGED_ROLE_OPTIONS, getDisplayRoles, getRoleMeta, normalizeManagedRoles } from './userRolesConfig'

const roleOptions = [
  { value: 'all', label: 'All Access' },
  { value: 'customer', label: 'Customer Only' },
  { value: 'admin', label: 'Admins' },
  { value: 'manager', label: 'Managers' },
  { value: 'delivery_partner', label: 'Delivery Partners' }
]

const mapUser = (user) => {
  const managedRoles = normalizeManagedRoles(user.roles || [])
  return {
    ...user,
    id: user._id || user.id,
    roles: managedRoles,
    displayRoles: getDisplayRoles(managedRoles),
    status: user.isBanned || user.blocked ? 'inactive' : 'active',
    blocked: Boolean(user.isBanned || user.blocked),
    lastActivity: user.lastLogin || user.updatedAt || user.createdAt
  }
}

export default function AdminUsers() {
  const { user } = useAuth()
  const base = usePanelBase()
  const location = useLocation()
  const isDeliveryPartner = hasDeliveryPartnerAccess(user)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)

  if (isDeliveryPartner) {
    return <Navigate to={`${base}/orders`} replace />
  }

  const loadUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams(location.search || '')
      const query = params.get('q') || ''
      if (query) setSearchTerm(query)

      const response = await adminAPI.getAllUsers(query ? { search: query } : {})
      const list = response?.users || response || []
      setUsers(list.map(mapUser))
    } catch (error) {
      console.error('Failed to load users:', error)
      toast.error(error?.response?.data?.error || 'Failed to load users')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [location.search])

  const filteredUsers = useMemo(() => (
    users.filter((candidate) => {
      const query = searchTerm.toLowerCase()
      const matchesSearch =
        (candidate.name || '').toLowerCase().includes(query) ||
        (candidate.email || '').toLowerCase().includes(query)

      const matchesRole =
        roleFilter === 'all' ||
        (roleFilter === 'customer'
          ? candidate.roles.length === 0
          : candidate.roles.includes(roleFilter))

      return matchesSearch && matchesRole
    })
  ), [users, searchTerm, roleFilter])

  const summaryCards = [
    { label: 'Total Accounts', value: users.length, icon: User, tone: 'bg-white text-gray-900 border-gray-200' },
    { label: 'Customer Only', value: users.filter((candidate) => candidate.roles.length === 0).length, icon: Mail, tone: 'bg-gray-50 text-gray-900 border-gray-200' },
    { label: 'Managers', value: users.filter((candidate) => candidate.roles.includes('manager')).length, icon: Shield, tone: 'bg-gray-800 text-white border-gray-800' },
    { label: 'Delivery Partners', value: users.filter((candidate) => candidate.roles.includes('delivery_partner')).length, icon: CircleOff, tone: 'bg-gray-600 text-white border-gray-600' },
    { label: 'Admins', value: users.filter((candidate) => candidate.roles.includes('admin')).length, icon: Shield, tone: 'bg-black text-white border-black' }
  ]

  const handleOpenRoleModal = (targetUser) => {
    setEditingUser(targetUser)
    setShowRoleModal(true)
  }

  const handleOpenEditModal = (targetUser) => {
    setEditingUser(targetUser)
    setShowEditModal(true)
  }

  const handleDeleteUser = async (userId) => {
    const targetUser = users.find((candidate) => candidate.id === userId)
    if (!targetUser) return

    if (targetUser.roles.includes('admin') && targetUser.email === 'admin@doordripp.local') {
      toast.error('The primary admin account cannot be deleted')
      return
    }

    if (!window.confirm(`Delete ${targetUser.name}? This cannot be undone.`)) return

    try {
      await adminAPI.deleteUser(userId)
      setUsers((current) => current.filter((candidate) => candidate.id !== userId))
      toast.success('User removed')
    } catch (error) {
      console.error('Failed to delete user:', error)
      toast.error(error?.response?.data?.error || 'Failed to delete user')
    }
  }

  const handleRoleChange = async (userId, roles) => {
    try {
      const response = await adminAPI.changeUserRole(userId, roles)
      const updatedUser = mapUser(response.user)
      setUsers((current) => current.map((candidate) => (
        candidate.id === userId ? { ...candidate, ...updatedUser } : candidate
      )))
      setShowRoleModal(false)
      setEditingUser(updatedUser)
      toast.success('Access updated')
    } catch (error) {
      console.error('Failed to update roles:', error)
      toast.error(error?.response?.data?.error || 'Failed to update roles')
      throw error
    }
  }

  const handleSaveUser = async (formData) => {
    if (!editingUser) return

    try {
      const response = await adminAPI.updateUser(editingUser.id, {
        name: formData.name,
        email: formData.email,
        roles: formData.roles,
        blocked: formData.status === 'inactive'
      })

      const updatedUser = mapUser(response)
      setUsers((current) => current.map((candidate) => (
        candidate.id === editingUser.id ? { ...candidate, ...updatedUser } : candidate
      )))
      setShowEditModal(false)
      setEditingUser(null)
      toast.success('User updated')
    } catch (error) {
      console.error('Failed to update user:', error)
      toast.error(error?.response?.data?.error || 'Failed to update user')
    }
  }

  const columns = [
    {
      header: 'Account',
      accessor: 'name',
      render: (candidate) => (
        <div>
          <div className="font-semibold text-gray-900">{candidate.name}</div>
          <div className="mt-1 text-sm text-gray-500">{candidate.email}</div>
        </div>
      )
    },
    {
      header: 'Access',
      accessor: 'displayRoles',
      render: (candidate) => (
        <div className="flex flex-wrap items-center gap-2">
          {candidate.displayRoles.map((roleId) => {
            const role = getRoleMeta(roleId)
            return (
              <span
                key={`${candidate.id}-${roleId}`}
                className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${role.badgeClass}`}
              >
                {role.name}
              </span>
            )
          })}
          <button
            onClick={() => handleOpenRoleModal(candidate)}
            className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2.5 py-1 text-[11px] font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
            title="Manage elevated roles"
          >
            <Shield size={12} />
            Edit Access
          </button>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (candidate) => (
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${candidate.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
          {candidate.status === 'active' ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      header: 'Last Activity',
      accessor: 'lastActivity',
      render: (candidate) => {
        const timestamp = candidate.lastActivity ? new Date(candidate.lastActivity) : null
        if (!timestamp || Number.isNaN(timestamp.getTime())) {
          return <span className="text-sm text-gray-400">No recent activity</span>
        }

        return (
          <div>
            <div className="text-sm text-gray-900">{timestamp.toLocaleDateString()}</div>
            <div className="text-xs text-gray-500">{timestamp.toLocaleTimeString()}</div>
          </div>
        )
      }
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (candidate) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenEditModal(candidate)}
            className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50 hover:text-blue-700"
            title="Edit user"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDeleteUser(candidate.id)}
            className="rounded-lg p-2 text-red-600 transition hover:bg-red-50 hover:text-red-700"
            title="Delete user"
            disabled={candidate.roles.includes('admin') && candidate.email === 'admin@doordripp.local'}
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ]

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-gray-100 bg-white px-6 py-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Admin Controls</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">Users and Roles</h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-500">
              Customer access is implicit for every account. Assign only the extra roles that unlock staff and delivery capabilities.
            </p>
          </div>
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-gray-300 focus:bg-white"
              />
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-3">
              <Filter size={16} className="text-gray-400" />
              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                className="bg-transparent py-2.5 pr-2 text-sm text-gray-700 outline-none"
              >
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {summaryCards.map((card) => (
          <div key={card.label} className={`rounded-[24px] border px-5 py-5 shadow-sm ${card.tone}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium opacity-80">{card.label}</p>
                <p className="mt-3 text-3xl font-bold">{card.value}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-3">
                <card.icon size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-[28px] border border-gray-100 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between px-2">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Account Directory</h2>
            <p className="text-sm text-gray-500">{filteredUsers.length} visible accounts</p>
          </div>
        </div>
        <AdminTable data={filteredUsers} columns={columns} />
      </div>

      {showRoleModal && editingUser && (
        <RoleChangeModal
          user={editingUser}
          onSubmit={handleRoleChange}
          onClose={() => {
            setShowRoleModal(false)
            setEditingUser(null)
          }}
        />
      )}

      {showEditModal && editingUser && (
        <UserEditorModal
          user={editingUser}
          onSave={handleSaveUser}
          onClose={() => {
            setShowEditModal(false)
            setEditingUser(null)
          }}
        />
      )}
    </div>
  )
}

function UserEditorModal({ user, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    status: user?.status || 'active',
    roles: normalizeManagedRoles(user?.roles || [])
  })
  const [errors, setErrors] = useState({})
  const displayRoles = getDisplayRoles(formData.roles)

  const handleFieldChange = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
  }

  const handleRoleToggle = (roleId) => {
    setFormData((current) => ({
      ...current,
      roles: current.roles.includes(roleId)
        ? current.roles.filter((role) => role !== roleId)
        : [...current.roles, roleId]
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const nextErrors = {}
    if (!formData.name.trim()) nextErrors.name = 'Name is required'
    if (!formData.email.trim()) nextErrors.email = 'Email is required'
    if (formData.email && !formData.email.includes('@')) nextErrors.email = 'Enter a valid email address'

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    onSave(formData)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div className="border-b border-gray-100 px-8 py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Edit User</h2>
              <p className="mt-1 text-sm text-gray-500">Update profile details, account state, and elevated access roles.</p>
            </div>
            <button onClick={onClose} className="rounded-2xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 px-8 py-7">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(event) => handleFieldChange('name', event.target.value)}
                className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 focus:border-gray-300 focus:bg-white'}`}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(event) => handleFieldChange('email', event.target.value)}
                className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 focus:border-gray-300 focus:bg-white'}`}
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Account Status</label>
            <select
              value={formData.status}
              onChange={(event) => handleFieldChange('status', event.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-gray-300 focus:bg-white"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Elevated Roles</h3>
                <p className="text-sm text-gray-500">Leave empty to keep the account as customer-only.</p>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {MANAGED_ROLE_OPTIONS.map((role) => {
                const selected = formData.roles.includes(role.id)
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleRoleToggle(role.id)}
                    className={`rounded-3xl border px-5 py-5 text-left transition ${selected ? role.cardClass : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300 hover:bg-gray-50'}`}
                  >
                    <p className="text-lg font-bold">{role.name}</p>
                    <p className={`mt-2 text-sm ${selected ? 'text-gray-100' : 'text-gray-500'}`}>{role.description}</p>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-gray-50 px-5 py-4">
            <p className="text-sm font-semibold text-gray-900">Effective access</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {displayRoles.map((roleId) => {
                const role = getRoleMeta(roleId)
                return (
                  <span key={roleId} className={`rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wide ${role.badgeClass}`}>
                    {role.name}
                  </span>
                )
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-2xl bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-900"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
