import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { hasDeliveryPartnerAccess } from '../../utils/roleUtils'
import { usePanelBase } from '../../hooks/usePanelBase'

export default function AdminReports() {
  const { user } = useAuth()
  const base = usePanelBase()
  const isDeliveryPartner = hasDeliveryPartnerAccess(user)
  
  if (isDeliveryPartner) {
    return <Navigate to={`${base}/orders`} replace />
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Reports</h1>
      <p className="text-sm text-gray-600">View your reports and analytics here.</p>
      <div className="mt-6 bg-white border rounded-lg p-6 text-center text-gray-500">No reports data available yet.</div>
    </div>
  )
}
