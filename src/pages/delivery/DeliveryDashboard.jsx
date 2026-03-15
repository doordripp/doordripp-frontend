import React, { useEffect, useState } from 'react'
import deliveryAPI from '../../services/deliveryAPI'
import { Package, ShoppingCart, CheckCircle, Clock } from 'lucide-react'
import { getOrderDisplayId } from '../../utils/orderUtils'

const StatCard = ({ title, value, icon: Icon, color = 'bg-gray-900' }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 shadow-sm">
    <div className={`${color} text-white p-3 rounded-lg`}>
      <Icon size={22} />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{title}</p>
    </div>
  </div>
)

export default function DeliveryDashboard() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    deliveryAPI.getMyOrders()
      .then(data => setOrders(data.orders || data || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [])

  const assigned = orders.filter(order => ['processing', 'shipped', 'packed', 'confirmed'].includes(order.status))
  const completed = orders.filter(order => order.status === 'delivered')
  const pending = orders.filter(order => order.status === 'pending')

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Delivery Dashboard</h1>
        <p className="text-gray-500 mt-1">Your delivery overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Orders" value={orders.length} icon={ShoppingCart} color="bg-black" />
        <StatCard title="Active" value={assigned.length} icon={Package} color="bg-gray-800" />
        <StatCard title="Pending" value={pending.length} icon={Clock} color="bg-gray-600" />
        <StatCard title="Completed" value={completed.length} icon={CheckCircle} color="bg-gray-700" />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Active Orders</h2>
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : assigned.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
            No active deliveries right now
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Order ID</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Customer</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Total</th>
                </tr>
              </thead>
              <tbody>
                {assigned.slice(0, 5).map(order => (
                  <tr key={order._id || order.id} className="border-b border-gray-100">
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      {getOrderDisplayId(order)}
                    </td>
                    <td className="px-4 py-3 text-gray-900">{order.customer?.name || 'Unknown'}</td>
                    <td className="px-4 py-3">
                      <span className="bg-gray-800 text-white text-xs px-2 py-0.5 rounded font-medium uppercase">
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">Rs {order.total || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
