import React, { useState, useEffect } from 'react'
import { Package, Search, Filter, Eye, Truck, CheckCircle, X } from 'lucide-react'
import { AdminButton, AdminTable } from '../../components/ui'
import { formatCurrency, formatDate } from '../../utils/adminHelpers'

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showOrderDetails, setShowOrderDetails] = useState(false)

  // Mock order data
  const mockOrders = [
    {
      id: '#ORD-001',
      customer: { name: 'John Doe', email: 'john.doe@email.com' },
      date: '2024-01-15',
      total: 129.99,
      status: 'pending',
      items: [
        { name: 'Premium Cotton T-Shirt', quantity: 2, price: 29.99 },
        { name: 'Wireless Headphones', quantity: 1, price: 69.99 }
      ],
      shipping: {
        address: '123 Main St, City, State 12345',
        method: 'Standard Delivery'
      }
    },
    {
      id: '#ORD-002',
      customer: { name: 'Jane Smith', email: 'jane.smith@email.com' },
      date: '2024-01-14',
      total: 89.99,
      status: 'shipped',
      items: [
        { name: 'Leather Wallet', quantity: 1, price: 49.99 },
        { name: 'Phone Case', quantity: 1, price: 39.99 }
      ],
      shipping: {
        address: '456 Oak Ave, City, State 54321',
        method: 'Express Delivery'
      }
    },
    {
      id: '#ORD-003',
      customer: { name: 'Mike Johnson', email: 'mike.johnson@email.com' },
      date: '2024-01-13',
      total: 199.99,
      status: 'delivered',
      items: [
        { name: 'Smart Watch', quantity: 1, price: 199.99 }
      ],
      shipping: {
        address: '789 Pine Rd, City, State 98765',
        method: 'Same Day Delivery'
      }
    }
  ]

  const statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setOrders(mockOrders)
      setLoading(false)
    }, 500)
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
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
      render: (order) => formatCurrency(order.total)
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (order) => (
        <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
          {getStatusIcon(order.status)}
          <span className="capitalize">{order.status}</span>
        </span>
      )
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
            value={order.status}
            onChange={(e) => handleStatusChange(order.id, e.target.value)}
            className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500"
          >
            {statusOptions.filter(opt => opt.value !== 'all').map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
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
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleViewOrder = (order) => {
    setSelectedOrder(order)
    setShowOrderDetails(true)
  }

  const handleStatusChange = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ))
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
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600">Manage customer orders and track shipments</p>
        </div>
        <div className="text-sm text-gray-500">
          {filteredOrders.length} orders
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
        />
      )}
    </div>
  )
}

// Order Details Modal Component
function OrderDetailsModal({ order, onClose, onStatusChange }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
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
                <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  <span className="capitalize">{order.status}</span>
                </span>
                <select
                  value={order.status}
                  onChange={(e) => {
                    onStatusChange(order.id, e.target.value)
                  }}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Order Date: {new Date(order.date).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="space-y-4 md:col-span-2">
            <h3 className="text-lg font-semibold">Shipping Information</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium">{order.shipping.method}</p>
              <p className="text-gray-600">{order.shipping.address}</p>
            </div>
          </div>

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
                      <td className="px-4 py-2">₹{item.price.toFixed(2)}</td>
                      <td className="px-4 py-2">₹{(item.quantity * item.price).toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-gray-400 font-semibold bg-gray-100">
                    <td className="px-4 py-2" colSpan="3">Total</td>
                    <td className="px-4 py-2">₹{order.total.toFixed(2)}</td>
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