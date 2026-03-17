import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { IndianRupee, ShoppingCart, RotateCcw, TrendingUp, Package } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { hasDeliveryPartnerAccess } from '../../utils/roleUtils'
import { usePanelBase } from '../../hooks/usePanelBase'
import { formatCurrency } from '../../utils/adminHelpers'
import adminAPI from '../../services/adminAPI'
import AdminTable from '../../components/ui/AdminTable'

export default function AdminReports() {
  const { user } = useAuth()
  const base = usePanelBase()
  const isDeliveryPartner = hasDeliveryPartnerAccess(user)

  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  if (isDeliveryPartner) {
    return <Navigate to={`${base}/orders`} replace />
  }

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)

    adminAPI.getReportStats()
      .then((data) => {
        if (!isMounted) return
        setStats(data)
      })
      .catch((err) => {
        if (!isMounted) return
        console.error('Failed to load report stats:', err)
        setError('Failed to load report data. Please try again.')
      })
      .finally(() => {
        if (!isMounted) return
        setLoading(false)
      })

    return () => { isMounted = false }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Reports</h1>
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-6 text-center text-red-600">
          {error}
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats?.totalRevenue ?? 0),
      icon: IndianRupee,
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      borderColor: 'border-green-500'
    },
    {
      title: 'Average Order Value',
      value: formatCurrency(stats?.aov ?? 0),
      icon: TrendingUp,
      color: 'blue',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-500'
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders ?? 0,
      subtitle: 'Confirmed + Shipped + Delivered',
      icon: ShoppingCart,
      color: 'purple',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
      borderColor: 'border-purple-500'
    },
    {
      title: 'Total Returns',
      value: stats?.totalReturns ?? 0,
      subtitle: 'Cancelled + Failed',
      icon: RotateCcw,
      color: 'orange',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600',
      borderColor: 'border-orange-500'
    }
  ]

  const productColumns = [
    {
      header: 'Product',
      accessor: 'name',
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.name}</p>
          {row.productId && (
            <p className="text-xs text-gray-500 mt-0.5 font-mono">ID: {row.productId}</p>
          )}
        </div>
      )
    },
    {
      header: 'Price',
      accessor: 'price',
      render: (row) => (
        <span className="font-medium text-gray-900">{formatCurrency(row.price)}</span>
      )
    },
    {
      header: 'Units Sold',
      accessor: 'unitsSold',
      render: (row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
          {row.unitsSold}
        </span>
      )
    },
    {
      header: 'Stock Remaining',
      accessor: 'stockRemaining',
      render: (row) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
          row.stockRemaining > 10
            ? 'bg-green-50 text-green-700'
            : row.stockRemaining > 0
            ? 'bg-yellow-50 text-yellow-700'
            : 'bg-red-50 text-red-700'
        }`}>
          {row.stockRemaining}
        </span>
      )
    },
    {
      header: 'Total Revenue',
      accessor: 'totalRevenue',
      render: (row) => (
        <span className="font-semibold text-gray-900">{formatCurrency(row.totalRevenue)}</span>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h1 className="text-2xl font-bold text-black mb-2">Reports & Analytics</h1>
        <p className="text-gray-600 font-medium">Detailed overview of your store's performance.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.title} className={`bg-white p-6 rounded-lg shadow border-l-4 ${card.borderColor}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                  {card.subtitle && (
                    <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
                  )}
                </div>
                <div className={`p-3 ${card.bgColor} rounded-full`}>
                  <Icon className={`w-6 h-6 ${card.textColor}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Product Revenue Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Package className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Revenue by Product</h3>
              <p className="text-sm text-gray-500">Total revenue generated by each product</p>
            </div>
          </div>
        </div>
        <AdminTable
          data={stats?.productRevenue ?? []}
          columns={productColumns}
        />
      </div>
    </div>
  )
}
