import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { UserPlus, Search, Filter, Edit, Trash2, Shield, User, X } from 'lucide-react'
import { AdminButton, AdminTable } from '../../components/ui'
import adminAPI from '../../services/adminAPI'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const location = useLocation()

  const roleOptions = [
    { value: 'all', label: 'All Roles' },
    { value: 'admin', label: 'Admin' },
    { value: 'manager', label: 'Manager' },
    { value: 'customer', label: 'Customer' }
  ]

  // Mock user data
  const mockUsers = [
    {
      id: 1,
      name: 'John Admin',
      email: 'admin@doordripp.local',
      role: 'admin',
      status: 'active',
      lastLogin: '2024-01-15T10:30:00Z',
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      name: 'Jane Doe',
      email: 'jane.doe@email.com',
      role: 'customer',
      status: 'active',
      lastLogin: '2024-01-14T15:45:00Z',
      createdAt: '2024-01-10T09:15:00Z'
    },
    {
      id: 3,
      name: 'Mike Manager',
      email: 'mike.manager@doordripp.local',
      role: 'manager',
      status: 'active',
      lastLogin: '2024-01-13T08:20:00Z',
      createdAt: '2024-01-05T12:00:00Z'
    },
    {
      id: 4,
      name: 'Sarah Smith',
      email: 'sarah.smith@email.com',
      role: 'customer',
      status: 'inactive',
      lastLogin: '2024-01-10T14:30:00Z',
      createdAt: '2024-01-08T16:45:00Z'
    }
  ]

  useEffect(() => {
    let mounted = true
    setLoading(true)
    
    // Read optional query param 'q' from location and use as search
    const params = new URLSearchParams(location.search || '')
    const q = params.get('q') || ''
    if (q) setSearchTerm(q)

    // Try fetching real users from API; pass search if available
    adminAPI.getCustomers(q ? { search: q } : {})
      .then((res) => {
        if (!mounted) return
        // API returns { users: [...]} or array; normalize and transform
        const data = (res && (res.users || res)) || []
        
        if (data && data.length > 0) {
          const transformedUsers = data.map(user => ({
            ...user,
            role: user.roles && user.roles.length > 0 ? user.roles[0] : 'customer',
            status: user.blocked ? 'inactive' : 'active',
            lastLogin: user.lastLogin || user.createdAt || new Date().toISOString()
          }))
          setUsers(transformedUsers)
        } else {
          // No data from API, use mock data
          console.warn('No users returned from API, using mock data')
          if (q) {
            const filtered = mockUsers.filter(u =>
              u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase())
            )
            setUsers(filtered)
          } else {
            setUsers(mockUsers)
          }
        }
      })
      .catch((err) => {
        console.warn('Failed to load users from API, falling back to mock', err)
        if (!mounted) return
        if (q) {
          const filtered = mockUsers.filter(u =>
            u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase())
          )
          setUsers(filtered)
        } else {
          setUsers(mockUsers)
        }
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => { mounted = false }
  }, [location.search])

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'manager':
        return 'bg-purple-100 text-purple-800'
      case 'customer':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Shield size={14} />
      case 'manager':
        return <Shield size={14} />
      case 'customer':
        return <User size={14} />
      default:
        return <User size={14} />
    }
  }

  const getStatusColor = (status) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800'
  }

  const columns = [
    {
      header: 'User',
      accessor: 'name',
      render: (user) => (
        <div>
          <div className="font-medium text-gray-900">{user.name}</div>
          <div className="text-sm text-gray-500">{user.email}</div>
        </div>
      )
    },
    {
      header: 'Role',
      accessor: 'role',
      render: (user) => (
        <select
          value={user.role || 'customer'}
          onChange={(e) => handleRoleChange(user._id || user.id, e.target.value)}
          className={`px-2 py-1 rounded-full text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${getRoleColor(user.role)}`}
        >
          <option value="customer">Customer</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (user) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
          {user.status === 'active' ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      header: 'Last Login',
      accessor: 'lastLogin',
      render: (user) => {
        const date = new Date(user.lastLogin)
        return (
          <div>
            <div className="text-sm">{date.toLocaleDateString()}</div>
            <div className="text-xs text-gray-500">{date.toLocaleTimeString()}</div>
          </div>
        )
      }
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (user) => (
        <div className="flex space-x-2">
          <button 
            onClick={() => handleEditUser(user)}
            className="text-blue-600 hover:text-blue-900"
            title="Edit User"
          >
            <Edit size={16} />
          </button>
          <button 
            onClick={() => handleDeleteUser(user.id)}
            className="text-red-600 hover:text-red-900"
            title="Delete User"
            disabled={user.role === 'admin' && user.email === 'admin@doordripp.local'}
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ]

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter

    return matchesSearch && matchesRole
  })

  const handleAddUser = () => {
    setEditingUser(null)
    setShowAddUserModal(true)
  }

  const handleEditUser = (user) => {
    setEditingUser(user)
    setShowAddUserModal(true)
  }

  const handleDeleteUser = async (userId) => {
    const user = users.find(u => u.id === userId)
    if (user.role === 'admin' && user.email === 'admin@doordripp.local') {
      alert('Cannot delete the main admin user')
      return
    }
    
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminAPI.deleteUser(userId)
        setUsers(users.filter(u => u.id !== userId))
      } catch (err) {
        console.error('Failed to delete user:', err)
        alert('Failed to delete user. Please try again.')
      }
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    try {
      const updated = await adminAPI.changeUserRole(userId, [newRole])
      
      setUsers(users.map(u => 
        u._id === userId || u.id === userId ? {
          ...u,
          role: updated.user.roles && updated.user.roles.length > 0 ? updated.user.roles[0] : 'customer'
        } : u
      ))
    } catch (err) {
      console.error('Failed to update user role:', err)
      alert('Failed to update user role. Please try again.')
    }
  }

  const handleSaveUser = async (userData) => {
    try {
      if (editingUser) {
        // Update existing user
        const updated = await adminAPI.updateUser(editingUser.id, {
          name: userData.name,
          email: userData.email,
          roles: [userData.role],
          blocked: userData.status === 'inactive'
        })
        
        setUsers(users.map(u => 
          u.id === editingUser.id ? {
            ...u,
            name: updated.name,
            email: updated.email,
            role: updated.roles && updated.roles.length > 0 ? updated.roles[0] : 'customer',
            status: updated.blocked ? 'inactive' : 'active'
          } : u
        ))
      } else {
        // Note: For adding new users, you'd need a separate endpoint or use auth signup
        // For now, this is a placeholder
        const newUser = {
          id: Date.now(),
          ...userData,
          status: 'active',
          lastLogin: new Date().toISOString(),
          createdAt: new Date().toISOString()
        }
        setUsers([newUser, ...users])
      }
      setShowAddUserModal(false)
    } catch (err) {
      console.error('Failed to save user:', err)
      alert('Failed to save user. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">Manage user accounts and permissions</p>
        </div>
        <AdminButton onClick={handleAddUser} className="flex items-center space-x-2">
          <UserPlus size={16} />
          <span>Add User</span>
        </AdminButton>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            {roleOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="text-sm text-gray-500">
          {filteredUsers.length} users
        </div>
      </div>

      {/* Users Table */}
      <AdminTable 
        data={filteredUsers}
        columns={columns}
      />

      {/* Add/Edit User Modal */}
      {showAddUserModal && (
        <UserModal
          user={editingUser}
          onSave={handleSaveUser}
          onClose={() => setShowAddUserModal(false)}
        />
      )}
    </div>
  )
}

// User Modal Component
function UserModal({ user, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'customer',
    status: user?.status || 'active'
  })

  const [errors, setErrors] = useState({})

  const roles = ['customer', 'manager', 'admin']

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Basic validation
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!formData.email.includes('@')) newErrors.email = 'Valid email is required'
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    onSave(formData)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 w-full max-w-md my-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            {user ? 'Edit User' : 'Add New User'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              required
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              }`}
              required
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              {roles.map(role => (
                <option key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <AdminButton 
              type="button" 
              variant="outline" 
              onClick={onClose}
            >
              Cancel
            </AdminButton>
            <AdminButton type="submit">
              {user ? 'Update User' : 'Add User'}
            </AdminButton>
          </div>
        </form>
      </div>
    </div>
  )
}