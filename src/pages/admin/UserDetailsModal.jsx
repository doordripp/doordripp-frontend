import React, { useState, useEffect } from 'react'
import { X, Mail, Phone, MapPin, Calendar, ShoppingBag, Star, Lock, AlertCircle } from 'lucide-react'
import { apiGet } from '../../services/apiClient'
import { toast } from 'react-hot-toast'

export default function UserDetailsModal({ user, onClose }) {
  const [details, setDetails] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await apiGet(`/admin/users/${user._id}`)
        setDetails(response)
      } catch (error) {
        console.error('Error fetching user details:', error)
        toast.error('Failed to load user details')
      } finally {
        setLoading(false)
      }
    }

    fetchUserDetails()
  }, [user._id])

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-2xl mx-4 p-6">
          <div className="text-center py-8">Loading user details...</div>
        </div>
      </div>
    )
  }

  if (!details) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-2xl mx-4 p-6">
          <div className="text-center py-8 text-red-600">Failed to load user details</div>
          <div className="text-right">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* User Profile */}
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900">{user.name}</h3>
              <p className="text-gray-600">{user.email}</p>
              {user.phone && <p className="text-gray-600">{user.phone}</p>}
            </div>
          </div>

          {/* Status Alert */}
          {user.isBanned && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">Account Banned</p>
                <p className="text-red-700 text-sm mt-1">{user.banReason}</p>
                {user.bannedAt && (
                  <p className="text-red-600 text-xs mt-2">
                    Banned on {new Date(user.bannedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Basic Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="h-4 w-4" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>

              {user.phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="h-4 w-4" />
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="font-medium">{user.phone}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <div>
                  <p className="text-xs text-gray-500">Member Since</p>
                  <p className="font-medium">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {user.phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Lock className="h-4 w-4" />
                  <div>
                    <p className="text-xs text-gray-500">Phone Verified</p>
                    <p className="font-medium">{user.isPhoneVerified ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Roles */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Roles</h4>
            <div className="flex flex-wrap gap-2">
              {user.roles?.map((role) => (
                <span
                  key={role}
                  className={`inline-flex items-center px-4 py-2 rounded-lg font-medium text-sm ${
                    role === 'admin'
                      ? 'bg-red-100 text-red-700'
                      : role === 'manager'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </span>
              ))}
            </div>
          </div>

          {/* Order Statistics */}
          {details.stats && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Order Statistics</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-xs text-blue-600 uppercase font-semibold">Total Orders</p>
                  <p className="text-2xl font-bold text-blue-900 mt-2">
                    {details.stats.totalOrders}
                  </p>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-xs text-green-600 uppercase font-semibold">
                    Completed
                  </p>
                  <p className="text-2xl font-bold text-green-900 mt-2">
                    {details.stats.completedOrders}
                  </p>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <p className="text-xs text-orange-600 uppercase font-semibold">
                    Pending
                  </p>
                  <p className="text-2xl font-bold text-orange-900 mt-2">
                    {details.stats.pendingOrders}
                  </p>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-xs text-purple-600 uppercase font-semibold">
                    Total Spent
                  </p>
                  <p className="text-2xl font-bold text-purple-900 mt-2">
                    ₹{(details.stats.totalSpent || 0).toLocaleString()}
                  </p>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4">
                  <p className="text-xs text-yellow-600 uppercase font-semibold">Avg Order</p>
                  <p className="text-2xl font-bold text-yellow-900 mt-2">
                    ₹{(details.stats.averageOrderValue || 0).toLocaleString()}
                  </p>
                </div>

                <div className="bg-indigo-50 rounded-lg p-4">
                  <p className="text-xs text-indigo-600 uppercase font-semibold">
                    Last Order
                  </p>
                  <p className="text-sm font-semibold text-indigo-900 mt-2">
                    {details.stats.lastOrderDate
                      ? new Date(details.stats.lastOrderDate).toLocaleDateString()
                      : 'Never'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Manager Assignment */}
          {details.managerFor && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Assigned Areas</h4>
              <div className="space-y-2">
                {Array.isArray(details.managerFor) ? (
                  details.managerFor.map((area) => (
                    <div
                      key={area._id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <MapPin className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="font-medium text-gray-900">{area.name}</p>
                        <p className="text-xs text-gray-500">
                          Coverage: {area.type || 'Standard'}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">Not assigned to any areas</p>
                )}
              </div>
            </div>
          )}

          {/* Recent Orders */}
          {details.recentOrders && details.recentOrders.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Recent Orders</h4>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {details.recentOrders.map((order) => (
                  <div key={order._id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Order #{order.orderNumber}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          ₹{order.totalAmount?.toLocaleString()}
                        </p>
                        <p className={`text-xs font-medium ${
                          order.status === 'completed'
                            ? 'text-green-600'
                            : order.status === 'cancelled'
                            ? 'text-red-600'
                            : 'text-orange-600'
                        }`}>
                          {order.status?.charAt(0).toUpperCase() +
                            order.status?.slice(1)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 text-right">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
