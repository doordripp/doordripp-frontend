import React, { useState } from 'react'
import { X, AlertTriangle, AlertCircle } from 'lucide-react'

export default function BanUserModal({ user, onSubmit, onClose }) {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  const commonReasons = [
    'Violation of terms of service',
    'Abusive behavior or harassment',
    'Fraudulent activity detected',
    'Multiple policy violations',
    'Suspicious payment activity',
    'Customer request',
    'Account security concerns',
    'Other - specify below'
  ]

  const handleSubmit = async () => {
    if (!reason.trim()) {
      alert('Please provide a reason for banning this user')
      return
    }

    try {
      setLoading(true)
      await onSubmit(user._id, reason)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="border-b border-red-200 bg-red-50 p-6 flex items-center justify-between rounded-t-lg">
          <h2 className="text-2xl font-bold text-red-900 flex items-center gap-2">
            <AlertTriangle className="h-6 w-6" />
            Ban User
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-100 rounded-lg transition"
          >
            <X className="h-6 w-6 text-red-700" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Alert */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">This action will:</p>
              <ul className="text-red-700 text-sm mt-2 space-y-1 list-disc list-inside">
                <li>Disable user account access</li>
                <li>Cancel active orders</li>
                <li>Suspend manager assignments if applicable</li>
                <li>Log the ban reason and admin who initiated it</li>
              </ul>
            </div>
          </div>

          {/* User Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Banning user:</p>
            <p className="text-lg font-bold text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>

          {/* Reason Selection */}
          <div>
            <label className="block font-semibold text-gray-900 mb-3">
              Reason for Banning
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">Select a reason...</option>
              {commonReasons.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Reason */}
          <div>
            <label className="block font-semibold text-gray-900 mb-3">
              Additional Details (Optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter specific details about the ban reason..."
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-2">
              {reason.length} characters · Max 500 characters
            </p>
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
            disabled={loading || !reason.trim()}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
          >
            {loading ? 'Banning...' : 'Confirm Ban'}
          </button>
        </div>
      </div>
    </div>
  )
}
