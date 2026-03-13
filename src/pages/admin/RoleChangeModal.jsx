import React, { useState } from 'react'
import { X, Shield, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function RoleChangeModal({ user, onSubmit, onClose }) {
  const [selectedRoles, setSelectedRoles] = useState(user.roles || ['customer'])
  const [loading, setLoading] = useState(false)

  const roles = [
    {
      id: 'customer',
      name: 'Customer',
      description: 'Can browse products and place orders',
      color: 'gray'
    },
    {
      id: 'manager',
      name: 'Manager',
      description: 'Can manage delivery zones and track deliveries',
      color: 'blue'
    },
    {
      id: 'delivery_partner',
      name: 'Delivery Partner',
      description: 'Can view and update delivery status for assigned areas only',
      color: 'green'
    },
    {
      id: 'admin',
      name: 'Admin',
      description: 'Full system access and management capabilities',
      color: 'red'
    }
  ]

  const handleRoleToggle = (roleId) => {
    setSelectedRoles((prev) => {
      const updated = [...prev]
      const index = updated.indexOf(roleId)

      if (index === -1) {
        updated.push(roleId)
      } else if (updated.length > 1) {
        // Ensure at least one role is selected
        updated.splice(index, 1)
      }

      return updated
    })
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      await onSubmit(user._id, selectedRoles)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRoleColor = (color) => {
    const colors = {
      gray: 'border-gray-300 bg-gray-50',
      blue: 'border-blue-300 bg-blue-50',
      green: 'border-green-300 bg-green-50',
      red: 'border-red-300 bg-red-50'
    }
    return colors[color] || 'border-gray-300 bg-gray-50'
  }

  const getRoleCheckboxColor = (color) => {
    const colors = {
      gray: 'accent-gray-600',
      blue: 'accent-blue-600',
      green: 'accent-green-600',
      red: 'accent-red-600'
    }
    return colors[color] || 'accent-gray-600'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl">
        {/* Header */}
        <div className="border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Change User Roles
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* User Info */}
          <div>
            <p className="text-sm text-gray-600">Editing roles for:</p>
            <p className="text-lg font-bold text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-900">Role Change Warning</p>
              <p className="text-yellow-700 text-sm mt-1">
                Changing user roles will affect their permissions and access to system features.
              </p>
            </div>
          </div>

          {/* Roles Selection */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Select Roles</h3>
            <div className="space-y-3">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition ${getRoleColor(
                    role.color
                  )} ${selectedRoles.includes(role.id) ? 'border-current' : 'border-opacity-50'}`}
                  onClick={() => handleRoleToggle(role.id)}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(role.id)}
                      onChange={() => handleRoleToggle(role.id)}
                      className={`mt-1 rounded cursor-pointer w-5 h-5 ${getRoleCheckboxColor(
                        role.color
                      )}`}
                      disabled={selectedRoles.length === 1 && selectedRoles.includes(role.id)}
                    />
                    <div className="flex-1">
                      <label className="font-semibold text-gray-900 cursor-pointer block">
                        {role.name}
                      </label>
                      <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Current Selection */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Current Selection</h3>
            <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
              {selectedRoles.length === 0 ? (
                <p className="text-gray-600">No roles selected</p>
              ) : (
                selectedRoles.map((role) => {
                  const roleObj = roles.find((r) => r.id === role)
                  return (
                    <span
                      key={role}
                      className={`inline-flex items-center px-4 py-2 rounded-lg font-medium text-sm ${
                        roleObj?.id === 'admin'
                          ? 'bg-red-100 text-red-700'
                          : roleObj?.id === 'delivery_partner'
                          ? 'bg-green-100 text-green-700'
                          : roleObj?.id === 'manager'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {roleObj?.name}
                    </span>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
          >
            {loading ? 'Updating...' : 'Update Roles'}
          </button>
        </div>
      </div>
    </div>
  )
}
