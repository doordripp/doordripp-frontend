import React, { useState, useEffect } from 'react'
import { X, MapPin, Plus, Trash2, Loader } from 'lucide-react'
import { apiGet, apiPost, apiDelete } from '../../services/apiClient'
import { toast } from 'react-hot-toast'

export default function AreaManagerModal({ user, onClose, onSuccess }) {
  const [deliveryZones, setDeliveryZones] = useState([])
  const [assignedZones, setAssignedZones] = useState([])
  const [selectedZone, setSelectedZone] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetching(true)
        // Fetch all delivery zones
        const zonesResponse = await apiGet('/admin/delivery-zones')
        setDeliveryZones(zonesResponse?.zones || [])

        // Fetch assigned zones for this manager
        const assignedResponse = await apiGet(`/admin/area-managers?manager=${user._id}`)
        setAssignedZones(assignedResponse?.assignments || [])
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Failed to load delivery zones')
      } finally {
        setFetching(false)
      }
    }

    if (user.roles?.includes('manager')) {
      fetchData()
    }
  }, [user._id, user.roles])

  const handleAssignZone = async () => {
    if (!selectedZone) {
      toast.error('Please select a delivery zone')
      return
    }

    // Check if already assigned
    if (assignedZones.some((zone) => zone.deliveryZone._id === selectedZone)) {
      toast.error('This zone is already assigned to this manager')
      return
    }

    try {
      setLoading(true)
      await apiPost('/admin/area-managers', {
        manager: user._id,
        deliveryZone: selectedZone
      })

      toast.success('Zone assigned successfully')
      setSelectedZone('')

      // Refresh assigned zones
      const response = await apiGet(`/admin/area-managers?manager=${user._id}`)
      setAssignedZones(response?.assignments || [])
      onSuccess?.()
    } catch (error) {
      console.error('Error:', error)
      toast.error(error?.message || 'Failed to assign zone')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveZone = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to remove this zone assignment?')) {
      return
    }

    try {
      setLoading(true)
      await apiDelete(`/admin/area-managers/${assignmentId}`)
      toast.success('Zone removed successfully')

      // Refresh assigned zones
      const response = await apiGet(`/admin/area-managers?manager=${user._id}`)
      setAssignedZones(response?.assignments || [])
      onSuccess?.()
    } catch (error) {
      console.error('Error:', error)
      toast.error(error?.message || 'Failed to remove zone')
    } finally {
      setLoading(false)
    }
  }

  // Filter out already assigned zones from the dropdown
  const availableZones = deliveryZones.filter(
    (zone) => !assignedZones.some((assigned) => assigned.deliveryZone._id === zone._id)
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl">
        {/* Header */}
        <div className="border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="h-6 w-6" />
            Assign Delivery Areas
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
            <p className="text-sm text-gray-600">Manager:</p>
            <p className="text-lg font-bold text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>

          {!user.roles?.includes('manager') ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-900 font-semibold">
                ⚠️ This user is not a manager
              </p>
              <p className="text-yellow-700 text-sm mt-1">
                Only users with the manager role can be assigned to delivery areas.
              </p>
            </div>
          ) : fetching ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-2 text-gray-600">
                <Loader className="h-5 w-5 animate-spin" />
                Loading delivery zones...
              </div>
            </div>
          ) : (
            <>
              {/* Assignment Form */}
              <div className="border-2 border-gray-200 rounded-lg p-4 space-y-4">
                <h3 className="font-semibold text-gray-900">Add New Area Assignment</h3>

                <div className="flex gap-2">
                  <select
                    value={selectedZone}
                    onChange={(e) => setSelectedZone(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select a delivery zone...</option>
                    {availableZones.map((zone) => (
                      <option key={zone._id} value={zone._id}>
                        {zone.name} ({zone.type || 'Standard'})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAssignZone}
                    disabled={loading || !selectedZone}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Assign
                  </button>
                </div>

                {availableZones.length === 0 && deliveryZones.length > 0 && (
                  <p className="text-sm text-gray-600">
                    ✓ All available zones have been assigned to this manager
                  </p>
                )}
              </div>

              {/* Assigned Zones */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">
                  Currently Assigned Areas ({assignedZones.length})
                </h3>

                {assignedZones.length === 0 ? (
                  <p className="text-gray-600 text-center py-6">
                    No zones assigned yet. Select a zone above to assign.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {assignedZones.map((assignment) => (
                      <div
                        key={assignment._id}
                        className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-green-600" />
                            <div>
                              <p className="font-semibold text-gray-900">
                                {assignment.deliveryZone?.name}
                              </p>
                              <p className="text-xs text-gray-600">
                                Type: {assignment.deliveryZone?.type || 'Standard'} · Status:{' '}
                                <span
                                  className={`font-medium ${
                                    assignment.status === 'active'
                                      ? 'text-green-600'
                                      : 'text-orange-600'
                                  }`}
                                >
                                  {assignment.status?.charAt(0).toUpperCase() +
                                    assignment.status?.slice(1)}
                                </span>
                              </p>
                            </div>
                          </div>

                          {/* Performance Stats */}
                          {assignment.performance && (
                            <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                              <div className="bg-white px-2 py-1 rounded">
                                <p className="text-gray-600">Orders</p>
                                <p className="font-semibold text-gray-900">
                                  {assignment.performance.ordersHandled}
                                </p>
                              </div>
                              <div className="bg-white px-2 py-1 rounded">
                                <p className="text-gray-600">Rating</p>
                                <p className="font-semibold text-gray-900">
                                  {assignment.performance.rating?.toFixed(1) || 'N/A'}⭐
                                </p>
                              </div>
                              <div className="bg-white px-2 py-1 rounded">
                                <p className="text-gray-600">Customers</p>
                                <p className="font-semibold text-gray-900">
                                  {assignment.performance.customersServed}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => handleRemoveZone(assignment._id)}
                          disabled={loading}
                          className="ml-4 p-2 text-red-600 hover:bg-red-100 rounded-lg transition disabled:opacity-50"
                          title="Remove assignment"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 text-right">
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
