import React, { useEffect, useState } from 'react'
import { Package, Search, Truck, CheckCircle, Navigation, Camera } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { hasDeliveryPartnerAccess } from '../../utils/roleUtils'
import deliveryAPI from '../../services/deliveryAPI'
import { getOrderDisplayId, getOrderEntityId, matchesOrderIdQuery } from '../../utils/orderUtils'

const DELIVERY_STATUS_FLOW = ['Order Placed', 'Accepted', 'Picked Up', 'Out For Delivery', 'Delivered']

const mapBackendOrder = (order) => ({
  id: getOrderEntityId(order),
  orderId: getOrderDisplayId(order),
  customer: {
    name: order.customer?.name || order.shippingAddress?.name || 'Customer',
    phone: order.customer?.phone || order.shippingAddress?.phone || ''
  },
  shippingAddress: order.shippingAddress,
  items: order.items || [],
  total: Number(order.total || 0),
  deliveryStatus: order.deliveryStatus || 'Order Placed',
  status: order.status || 'pending',
  createdAt: order.createdAt || order.date
})

const deriveOrderStatus = (deliveryStatus, currentStatus) => {
  switch (deliveryStatus) {
    case 'Accepted':
      return 'packed'
    case 'Picked Up':
      return 'processing'
    case 'Out For Delivery':
      return 'shipped'
    case 'Delivered':
      return 'delivered'
    default:
      return currentStatus
  }
}

const getStatusOptions = (currentStatus) => {
  const currentIndex = DELIVERY_STATUS_FLOW.indexOf(currentStatus)
  return currentIndex === -1 ? DELIVERY_STATUS_FLOW : DELIVERY_STATUS_FLOW.slice(currentIndex)
}

export default function DeliveryOrders() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isDeliveryPartner = hasDeliveryPartnerAccess(user)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await deliveryAPI.getMyOrders()
        const list = data?.orders || data || []
        setOrders(list.map(mapBackendOrder))
      } catch (err) {
        console.error('Failed to load my delivery orders:', err)
        setOrders([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const filtered = orders.filter((order) => {
    const query = searchTerm.toLowerCase()
    const matchesSearch =
      matchesOrderIdQuery(order, query) ||
      order.customer.name.toLowerCase().includes(query) ||
      (order.customer.phone || '').toLowerCase().includes(query)

    const status = order.deliveryStatus || 'Order Placed'
    const matchesStatus = statusFilter === 'all' || status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleStatusChange = async (orderId, nextStatus) => {
    try {
      await deliveryAPI.updateOrderStatus(orderId, nextStatus)
      setOrders((current) =>
        current.map((order) =>
          order.id === orderId
            ? {
                ...order,
                deliveryStatus: nextStatus,
                status: deriveOrderStatus(nextStatus, order.status)
              }
            : order
        )
      )
      toast.success(`Order marked ${nextStatus}`)
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to update delivery status')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Order Placed':
        return 'bg-slate-100 text-slate-800'
      case 'Accepted':
        return 'bg-blue-100 text-blue-800'
      case 'Picked Up':
        return 'bg-violet-100 text-violet-800'
      case 'Out For Delivery':
        return 'bg-orange-100 text-orange-800'
      case 'Delivered':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Order Placed':
        return <Package size={14} />
      case 'Accepted':
        return <CheckCircle size={14} />
      case 'Picked Up':
        return <Package size={14} />
      case 'Out For Delivery':
        return <Truck size={14} />
      case 'Delivered':
        return <CheckCircle size={14} />
      default:
        return <Package size={14} />
    }
  }

  if (!isDeliveryPartner) {
    return <div className="p-6 text-center text-gray-500">This panel is only for delivery partners.</div>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Deliveries</h1>
          <p className="text-gray-600">Orders assigned to you. Update statuses as you progress.</p>
        </div>
        <div className="text-sm text-gray-500">{filtered.length} deliveries</div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by order, customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All statuses</option>
            {DELIVERY_STATUS_FLOW.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center text-gray-400">
          No deliveries found.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Order</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Customer</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Total</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => {
                const status = order.deliveryStatus || 'Order Placed'
                return (
                  <tr key={order.id} className="border-b border-gray-100">
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{order.orderId}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{order.customer.name}</div>
                      <div className="text-xs text-gray-500">{order.customer.phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                          {getStatusIcon(status)}
                          <span>{status}</span>
                        </span>
                        {status !== 'Delivered' && (
                          <select
                            value={status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className="border border-gray-300 rounded-md px-2 py-1 text-xs"
                          >
                            {getStatusOptions(status).map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      Rs {order.total.toFixed ? order.total.toFixed(2) : order.total}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/delivery/track/${order.id}`)}
                          className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                          <Navigation size={14} />
                          Track
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`/delivery/proof/${order.id}`)}
                          className="inline-flex items-center gap-1 rounded-md bg-black px-2 py-1 text-xs font-medium text-white hover:bg-gray-800"
                        >
                          <Camera size={14} />
                          Proof
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
