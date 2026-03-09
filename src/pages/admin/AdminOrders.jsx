import React, { useState, useEffect } from 'react'
import { Package, Search, Filter, Eye, Truck, CheckCircle, X, MapPin, ExternalLink } from 'lucide-react'
import { AdminButton, AdminTable } from '../../components/ui'
import { formatCurrency, formatDate } from '../../utils/adminHelpers'
import { apiGet, apiPut, apiPost, apiPatch } from '../../services/apiClient'
import { useAuth } from '../../context/AuthContext'
import { hasDeliveryPartnerAccess } from '../../utils/roleUtils'

const DELIVERY_STATUS_FLOW = ['Order Placed', 'Accepted', 'Picked Up', 'Out For Delivery', 'Delivered']
const LEGACY_TO_DELIVERY_STATUS = {
  pending: 'Order Placed',
  confirmed: 'Order Placed',
  packed: 'Accepted',
  processing: 'Picked Up',
  shipped: 'Out For Delivery',
  delivered: 'Delivered'
}

const getDeliveryStatus = (order) => {
  if (order?.deliveryStatus && DELIVERY_STATUS_FLOW.includes(order.deliveryStatus)) {
    return order.deliveryStatus
  }
  return LEGACY_TO_DELIVERY_STATUS[order?.status] || 'Order Placed'
}

export default function AdminOrders() {
  const { user } = useAuth()
  const currentUserId = String(user?._id || user?.id || '')
  const isDeliveryPartner = hasDeliveryPartnerAccess(user)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showOrderDetails, setShowOrderDetails] = useState(false)

  const toAddressLine = (addr) => {
    if (!addr) return ''
    const parts = [addr.name, addr.line1, addr.line2, addr.city, addr.state, addr.zip, addr.phone].filter(Boolean)
    return parts.join(', ')
  }

  const statusOptions = isDeliveryPartner
    ? [
        { value: 'all', label: 'All Orders' },
        { value: 'Order Placed', label: 'Order Placed' },
        { value: 'Accepted', label: 'Accepted' },
        { value: 'Picked Up', label: 'Picked Up' },
        { value: 'Out For Delivery', label: 'Out For Delivery' },
        { value: 'Delivered', label: 'Delivered' }
      ]
    : [
        { value: 'all', label: 'All Orders' },
        { value: 'pending', label: 'Pending' },
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'packed', label: 'Packed' },
        { value: 'processing', label: 'Processing' },
        { value: 'shipped', label: 'Shipped' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'cancelled', label: 'Cancelled' }
      ]

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const query = !isDeliveryPartner && statusFilter && statusFilter !== 'all' ? `?status=${statusFilter}` : ''
        const res = await apiGet(`/admin/orders${query}`)
        const mapped = (res.orders || []).map(o => ({
          id: o.id || o._id,
          customer: { name: o.customer || 'Unknown', email: o.customerEmail || '' },
          date: o.date || o.createdAt,
          total: o.total || 0,
          totalBeforeDiscount: o.totalBeforeDiscount || o.total || 0,
          voucherDiscount: o.voucherDiscount || 0,
          voucher: o.voucher || null,
          status: o.status || 'pending',
          assignedDeliveryPartner: o.assignedDeliveryPartner,
          deliveryStatus: o.deliveryStatus || LEGACY_TO_DELIVERY_STATUS[o.status] || 'Order Placed',
          statusHistory: o.statusHistory || [],
          isTrial: o.isTrial || false,
          trialItems: o.trialItems || [],
          trialFee: o.trialFee || 0,
          deliveryFee: o.deliveryFee || 0,
          items: o.items || [],
          deliveryPartner: o.deliveryPartner,
          shippingAddress: o.shippingAddress,
          shipping: { address: toAddressLine(o.shippingAddress), method: 'Standard Delivery' }
        }))
        setOrders(mapped)
      } catch (e) {
        console.error('Failed to load admin orders:', e)
        setOrders([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [statusFilter, isDeliveryPartner])

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-indigo-100 text-indigo-800'
      case 'packed':
        return 'bg-cyan-100 text-cyan-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getDeliveryStatusColor = (status) => {
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
      case 'pending':
        return <Package size={14} />
      case 'confirmed':
        return <CheckCircle size={14} />
      case 'packed':
        return <Package size={14} />
      case 'processing':
        return <Package size={14} />
      case 'shipped':
        return <Truck size={14} />
      case 'delivered':
        return <CheckCircle size={14} />
      case 'cancelled':
        return <X size={14} />
      default:
        return <Package size={14} />
    }
  }

  const getDeliveryStatusIcon = (status) => {
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

  const columns = [
    {
      header: 'Order ID',
      accessor: 'id',
      render: (order) => (
        <div className="font-medium text-gray-900">{order.id}</div>
      )
    },
    {
      header: 'Customer',
      accessor: 'customer',
      render: (order) => (
        <div>
          <div className="font-medium text-gray-900">{order.customer.name}</div>
          <div className="text-sm text-gray-500">{order.customer.email}</div>
        </div>
      )
    },
    {
      header: 'Date',
      accessor: 'date',
      render: (order) => formatDate(order.date)
    },
    {
      header: 'Total',
      accessor: 'total',
      render: (order) => (
        <div>
          <div>{formatCurrency(order.total)}</div>
          {order.voucherDiscount > 0 && (
            <div className="text-xs text-green-700">
              Saved {formatCurrency(order.voucherDiscount)}{order.voucher?.code ? ` (${order.voucher.code})` : ''}
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (order) => {
        const currentStatus = isDeliveryPartner ? getDeliveryStatus(order) : order.status
        const colorClass = isDeliveryPartner ? getDeliveryStatusColor(currentStatus) : getStatusColor(currentStatus)
        const statusIcon = isDeliveryPartner ? getDeliveryStatusIcon(currentStatus) : getStatusIcon(currentStatus)
        return (
        <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
          {statusIcon}
          <span>{currentStatus}</span>
        </span>
      )
      }
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (order) => (
        <div className="flex space-x-2">
          <button 
            onClick={() => handleViewOrder(order)}
            className="text-blue-600 hover:text-blue-900"
            title="View Details"
          >
            <Eye size={16} />
          </button>
          <select
            value={isDeliveryPartner ? getDeliveryStatus(order) : order.status}
            onChange={(e) => handleStatusChange(order.id, e.target.value)}
            disabled={isDeliveryPartner && String(order.assignedDeliveryPartner || order.deliveryPartner?.id || order.deliveryPartner?.riderId || '') !== currentUserId}
            className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500"
          >
            {isDeliveryPartner ? (
              <>
                <option value="Order Placed">Order Placed</option>
                <option value="Accepted">Accepted</option>
                <option value="Picked Up">Picked Up</option>
                <option value="Out For Delivery">Out For Delivery</option>
                <option value="Delivered">Delivered</option>
              </>
            ) : (
              <>
                {statusOptions.filter(opt => opt.value !== 'all').map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>
      )
    }
  ]

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const currentStatus = isDeliveryPartner ? getDeliveryStatus(order) : order.status
    const matchesStatus = statusFilter === 'all' || currentStatus === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleViewOrder = (order) => {
    setSelectedOrder(order)
    setShowOrderDetails(true)
  }

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      if (isDeliveryPartner) {
        const targetOrder = orders.find((o) => o.id === orderId)
        const assignedTo = String(targetOrder?.assignedDeliveryPartner || targetOrder?.deliveryPartner?.id || targetOrder?.deliveryPartner?.riderId || '')
        const isMine = assignedTo && assignedTo === currentUserId
        if (!isMine) {
          alert('Please accept this delivery first, or this order is assigned to another delivery partner.')
          return
        }
        await apiPatch(`/delivery-partner/orders/${orderId}/status`, { status: newStatus })
      } else {
        await apiPut(`/admin/orders/${orderId}/status`, { status: newStatus })
      }
      setOrders(orders.map(order => 
        order.id === orderId
          ? {
              ...order,
              ...(isDeliveryPartner
                ? {
                    deliveryStatus: newStatus,
                    status: newStatus === 'Delivered' ? 'delivered' : order.status
                  }
                : { status: newStatus })
            }
          : order
      ))
      // Update selected order if it's open
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(
          isDeliveryPartner
            ? {
                ...selectedOrder,
                deliveryStatus: newStatus,
                status: newStatus === 'Delivered' ? 'delivered' : selectedOrder.status
              }
            : { ...selectedOrder, status: newStatus }
        )
      }
    } catch (e) {
      console.error('Failed to update order status:', e)
      alert('Failed to update order status')
    }
  }

  const handleAcceptDelivery = async (orderId) => {
    try {
      const response = await apiPost(`/admin/orders/${orderId}/accept`, {})
      
      // Refresh orders list
      const query = !isDeliveryPartner && statusFilter && statusFilter !== 'all' ? `?status=${statusFilter}` : ''
      const res = await apiGet(`/admin/orders${query}`)
      const mapped = (res.orders || []).map(o => ({
        id: o.id || o._id,
        customer: { name: o.customer || 'Unknown', email: o.customerEmail || '' },
        date: o.date || o.createdAt,
        total: o.total || 0,
        totalBeforeDiscount: o.totalBeforeDiscount || o.total || 0,
        voucherDiscount: o.voucherDiscount || 0,
        voucher: o.voucher || null,
        status: o.status || 'pending',
        assignedDeliveryPartner: o.assignedDeliveryPartner,
        deliveryStatus: o.deliveryStatus || LEGACY_TO_DELIVERY_STATUS[o.status] || 'Order Placed',
        statusHistory: o.statusHistory || [],
        isTrial: o.isTrial || false,
        trialItems: o.trialItems || [],
        trialFee: o.trialFee || 0,
        deliveryFee: o.deliveryFee || 0,
        items: o.items || [],
        deliveryPartner: o.deliveryPartner,
        shippingAddress: o.shippingAddress,
        shipping: { address: toAddressLine(o.shippingAddress), method: 'Standard Delivery' }
      }))
      setOrders(mapped)
      
      // Update selected order
      if (selectedOrder?.id === orderId) {
        const updatedOrder = mapped.find(o => o.id === orderId)
        setSelectedOrder(updatedOrder)
      }
      
      alert('Delivery accepted successfully! You can now start tracking.')
    } catch (e) {
      console.error('Failed to accept delivery:', e)
      alert(e.response?.data?.error || 'Failed to accept delivery')
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
          <h1 className="text-2xl font-bold text-gray-900">{isDeliveryPartner ? 'My Deliveries' : 'Orders'}</h1>
          <p className="text-gray-600">
            {isDeliveryPartner 
              ? 'View and update delivery status for orders in your assigned area' 
              : 'Manage customer orders and track shipments'}
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {filteredOrders.length} {isDeliveryPartner ? 'deliveries' : 'orders'}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search orders, customers..."
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
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <AdminTable 
        data={filteredOrders}
        columns={columns}
      />

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setShowOrderDetails(false)}
          onStatusChange={handleStatusChange}
          onAcceptDelivery={handleAcceptDelivery}
        />
      )}
    </div>
  )
}

// Order Details Modal Component
function OrderDetailsModal({ order, onClose, onStatusChange, onAcceptDelivery }) {
  const { user } = useAuth()
  const isDeliveryPartner = hasDeliveryPartnerAccess(user)
  const [accepting, setAccepting] = useState(false)

  const handleAccept = async () => {
    setAccepting(true)
    try {
      await onAcceptDelivery(order.id)
    } finally {
      setAccepting(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'packed':
        return 'bg-cyan-100 text-cyan-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getDeliveryStatusColor = (status) => {
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
      case 'pending':
        return <Package size={14} />
      case 'packed':
        return <Package size={14} />
      case 'processing':
        return <Package size={14} />
      case 'shipped':
        return <Truck size={14} />
      case 'delivered':
        return <CheckCircle size={14} />
      case 'cancelled':
        return <X size={14} />
      default:
        return <Package size={14} />
    }
  }

  const getDeliveryStatusIcon = (status) => {
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

  const currentStatus = isDeliveryPartner ? getDeliveryStatus(order) : order.status

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl my-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Order Details - {order.id}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Customer Information</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium">{order.customer.name}</p>
              <p className="text-gray-600">{order.customer.email}</p>
            </div>
          </div>

          {/* Order Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Order Status</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${isDeliveryPartner ? getDeliveryStatusColor(currentStatus) : getStatusColor(currentStatus)}`}>
                  {isDeliveryPartner ? getDeliveryStatusIcon(currentStatus) : getStatusIcon(currentStatus)}
                  <span>{currentStatus}</span>
                </span>
                <select
                  value={currentStatus}
                  onChange={(e) => {
                    onStatusChange(order.id, e.target.value)
                  }}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  {isDeliveryPartner ? (
                    <>
                      <option value="Order Placed">Order Placed</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Picked Up">Picked Up</option>
                      <option value="Out For Delivery">Out For Delivery</option>
                      <option value="Delivered">Delivered</option>
                    </>
                  ) : (
                    <>
                      <option value="pending">Pending</option>
                      <option value="packed">Packed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </>
                  )}
                </select>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Order Date: {new Date(order.date).toLocaleDateString()}
              </p>
              {order.voucherDiscount > 0 && (
                <p className="text-sm text-green-700 mt-2">
                  Coupon: {order.voucher?.code || 'Applied'} (Saved {formatCurrency(order.voucherDiscount)})
                </p>
              )}
            </div>
          </div>

          {/* Accept Delivery Button (for delivery partners) */}
          {isDeliveryPartner && !(order.deliveryPartner?.id || order.deliveryPartner?.riderId) && ['pending', 'confirmed', 'packed'].includes(order.status) && (
            <div className="md:col-span-2">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-green-800 mb-2">Ready to deliver?</h3>
                    <p className="text-sm text-gray-700">
                      Accept this order to start delivery and enable real-time tracking for the customer.
                    </p>
                  </div>
                  <button
                    onClick={handleAccept}
                    disabled={accepting}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {accepting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Accepting...
                      </>
                    ) : (
                      <>
                        <Truck size={18} />
                        Accept Delivery
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delivery Partner Info & Tracking */}
          {(order.deliveryPartner?.id || order.deliveryPartner?.riderId) && (
            <div className="md:col-span-2">
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {order.deliveryPartner.photo && (
                      <img 
                        src={order.deliveryPartner.photo} 
                        alt="Delivery Partner"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-blue-900">Delivery Partner Assigned</h3>
                      <p className="text-sm text-blue-700">{order.deliveryPartner.name}</p>
                      {order.deliveryPartner.phone && (
                        <p className="text-xs text-gray-600">{order.deliveryPartner.phone}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <a
                      href={`/order/${order.id}/track`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2 text-sm"
                    >
                      <MapPin size={16} />
                      Live Tracking
                      <ExternalLink size={14} />
                    </a>
                    {isDeliveryPartner && (
                      <button
                        onClick={() => {
                          const trackingUrl = `${window.location.origin}/order/${order.id}/track`;
                          navigator.clipboard.writeText(trackingUrl);
                          alert('Tracking link copied to clipboard! Share it with the customer.');
                        }}
                        className="px-4 py-2 bg-white border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 flex items-center justify-center gap-2 text-sm"
                      >
                        📋 Copy Tracking Link
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-600">
                  The customer can track this order in real-time at: 
                  <span className="font-mono ml-1">/order/{order.id}/track</span>
                </p>
              </div>
            </div>
          )}

          {/* Shipping Information */}
          <div className="space-y-4 md:col-span-2">
            <h3 className="text-lg font-semibold">Shipping Information</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium">{order.isTrial ? 'Trial & Buy Delivery' : order.shipping.method}</p>
              <p className="text-gray-600">{order.shipping.address}</p>
            </div>
          </div>

          {/* Trial Items if applicable */}
          {order.isTrial && order.trialItems && order.trialItems.length > 0 && (
            <div className="space-y-4 md:col-span-2">
              <h3 className="text-lg font-semibold text-indigo-700">Trial Room Package</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {order.trialItems.map((ti, idx) => {
                  const isMain = order.items.some(it => String(it.product?._id || it.product) === String(ti.product?._id || ti.product));
                  return (
                    <div key={idx} className={`bg-white p-3 rounded-xl border-2 ${isMain ? 'border-indigo-600 shadow-sm' : 'border-dashed border-gray-200 opacity-60'}`}>
                      <img src={ti.image} alt={ti.name} className="w-full h-20 object-cover rounded-md mb-2" />
                      <div className="text-xs font-bold truncate">{ti.name}</div>
                      <div className="text-[10px] text-gray-500">{isMain ? 'PURCHASED' : 'TRIAL ITEM'}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="space-y-4 md:col-span-2">
            <h3 className="text-lg font-semibold">Order Items</h3>
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-left">Item</th>
                    <th className="px-4 py-2 text-left">Quantity</th>
                    <th className="px-4 py-2 text-left">Price</th>
                    <th className="px-4 py-2 text-left">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, index) => (
                    <tr key={index} className="border-t border-gray-300">
                      <td className="px-4 py-2">{item.name}</td>
                      <td className="px-4 py-2">{item.quantity}</td>
                      <td className="px-4 py-2">{formatCurrency(item.price)}</td>
                      <td className="px-4 py-2">{formatCurrency(item.quantity * item.price)}</td>
                    </tr>
                  ))}
                  {order.isTrial && (
                    <tr className="border-t border-gray-300 text-indigo-600 font-medium italic">
                      <td className="px-4 py-1" colSpan="3">Trial Service Fee</td>
                      <td className="px-4 py-1">{formatCurrency(order.trialFee || 119)}</td>
                    </tr>
                  )}
                  {order.shippingFee > 0 && (
                    <tr className="border-t border-gray-300 text-gray-500 font-medium italic">
                      <td className="px-4 py-1" colSpan="3">Delivery Fee ({order.shipping?.method || 'Standard'})</td>
                      <td className="px-4 py-1">{formatCurrency(order.shippingFee)}</td>
                    </tr>
                  )}
                  {order.voucherDiscount > 0 && (
                    <tr className="border-t border-gray-300 text-green-700 font-medium italic">
                      <td className="px-4 py-1" colSpan="3">
                        Voucher Discount {order.voucher?.code ? `(${order.voucher.code})` : ''}
                      </td>
                      <td className="px-4 py-1">-{formatCurrency(order.voucherDiscount)}</td>
                    </tr>
                  )}
                  <tr className="border-t-2 border-gray-400 font-semibold bg-gray-100">
                    <td className="px-4 py-2" colSpan="3">{order.voucherDiscount > 0 ? 'Payable Total' : 'Grand Total'}</td>
                    <td className="px-4 py-2">{formatCurrency(order.total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <AdminButton onClick={onClose}>Close</AdminButton>
        </div>
      </div>
    </div>
  )
}


