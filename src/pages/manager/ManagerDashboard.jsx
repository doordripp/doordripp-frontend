import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Package, ShoppingCart, Users, Truck, 
  ArrowRight, Search, Filter, CheckCircle, 
  Clock, AlertCircle, X, ChevronRight, UserPlus, 
  MoreVertical, Edit3, Trash2
} from 'lucide-react'
import adminAPI from '../../services/adminAPI'
import managerAPI from '../../services/managerAPI'
import { toast } from 'react-hot-toast'
import { usePanelBase } from '../../hooks/usePanelBase'
import { getOrderDisplayId, matchesOrderIdQuery } from '../../utils/orderUtils'

const StatCard = ({ title, value, icon: Icon, color = "black", onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white border border-gray-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all ${onClick ? 'cursor-pointer hover:border-black' : ''}`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</p>
        <p className="text-3xl font-black text-gray-900">{value}</p>
      </div>
      <div className={`p-4 rounded-2xl bg-gray-50 text-${color}`}>
        <Icon size={24} />
      </div>
    </div>
  </div>
)

const normalizeDashboardOrder = (order) => ({
  ...order,
  customer: typeof order.customer === 'string'
    ? { name: order.customer }
    : (order.customer || { name: 'Guest' })
})

const OrderAssignmentRow = ({ order, partners, onUpdate, onViewOrder }) => {
  const [showAssign, setShowAssign] = useState(false)
  const [loading, setLoading] = useState(false)
  const orderId = order._id || order.id

  const handleAssign = async (partnerId) => {
    try {
      setLoading(true)
      await adminAPI.assignDeliveryPartner(orderId, partnerId)
      toast.success('Partner assigned')
      setShowAssign(false)
      onUpdate()
    } catch (err) {
      toast.error('Failed to assign partner')
    } finally {
      setLoading(false)
    }
  }

  const handleUnassign = async () => {
    try {
      setLoading(true)
      await adminAPI.unassignDeliveryPartner(orderId)
      toast.success('Partner unassigned')
      onUpdate()
    } catch (err) {
      toast.error('Failed to unassign partner')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border-b last:border-0 border-gray-50 py-4 group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="bg-gray-100 p-3 rounded-2xl text-gray-900 group-hover:bg-black group-hover:text-white transition-colors shrink-0">
             <ShoppingCart size={18} />
          </div>
          <button
            type="button"
            onClick={() => onViewOrder && onViewOrder(order)}
            className="text-left flex-1 min-w-0 focus:outline-none focus:ring-0"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-gray-900">{getOrderDisplayId(orderId)}</span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${
                order.status === 'delivered' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600'
              }`}>
                {order.status?.toUpperCase()}
              </span>
            </div>
            <p className="text-xs font-bold text-gray-400 mt-0.5">{order.customer?.name || 'Guest'} • {new Date(order.date || order.createdAt).toLocaleDateString()}</p>
          </button>
        </div>

        <div className="flex items-center gap-4">
           <div className="text-right mr-4">
              <p className="text-xs font-bold text-gray-400 mb-1 tracking-tighter uppercase">Rider Assigned</p>
              {order.assignedDeliveryPartner || order.deliveryPartner?.riderId ? (
                <div className="flex items-center gap-2 justify-end">
                   <span className="text-sm font-black text-gray-900">{order.deliveryPartner?.name || 'Assigned'}</span>
                   <button onClick={handleUnassign} className="text-red-500 hover:bg-red-50 p-1 rounded-lg transition-colors">
                      <X size={14} />
                   </button>
                </div>
              ) : (
                <button 
                  onClick={() => setShowAssign(true)}
                  className="text-xs font-black bg-gray-900 text-white px-3 py-1.5 rounded-xl hover:bg-black transition-all"
                >
                  ASSIGN RIDER
                </button>
              )}
           </div>
           <ChevronRight size={18} className="text-gray-300 group-hover:text-black transition-colors" />
        </div>
      </div>

      {showAssign && (
        <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between mb-3">
             <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">Select Partner for Assignment</h4>
             <button onClick={() => setShowAssign(false)} className="text-gray-400 hover:text-black"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {partners.filter(p => !p.isBanned && !p.blocked).map(p => (
              <button 
                key={p._id} 
                onClick={() => handleAssign(p._id)}
                disabled={loading}
                className="text-[10px] font-bold p-2 bg-white border border-gray-200 rounded-xl hover:border-black transition-all flex items-center justify-between group/p"
              >
                <span className="truncate">{p.name}</span>
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" title="Active" />
              </button>
            ))}
            {partners.length === 0 && <p className="text-xs text-gray-400 col-span-full py-2">No available partners</p>}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ManagerDashboard() {
  const navigate = useNavigate()
  const base = usePanelBase()
  const [stats, setStats] = useState({ products: 0, orders: 0, customers: 0, partners: 0 })
  const [orders, setOrders] = useState([])
  const [partners, setPartners] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const loadData = async () => {
    try {
      setLoading(true)
      const [statsResult, ordersResult, partnersResult] = await Promise.allSettled([
        adminAPI.getStats(),
        adminAPI.getOrders({ limit: 'all' }),
        managerAPI.getDeliveryPartners()
      ])

      const statsData = statsResult.status === 'fulfilled' ? statsResult.value : null
      const ordersData = ordersResult.status === 'fulfilled' ? ordersResult.value : null
      const partnersData = partnersResult.status === 'fulfilled' ? partnersResult.value : null

      setStats({
        products: statsData?.totalProducts || 0,
        orders: statsData?.totalOrders || 0,
        customers: statsData?.totalCustomers || 0,
        partners: partnersData?.users?.length || 0
      })

      setOrders((ordersData?.orders || []).map(normalizeDashboardOrder))
      setPartners(partnersData?.users || [])

      if (!statsData || !ordersData || !partnersData) {
        console.error('Manager dashboard partial sync failure', {
          statsError: statsResult.status === 'rejected' ? statsResult.reason : null,
          ordersError: ordersResult.status === 'rejected' ? ordersResult.reason : null,
          partnersError: partnersResult.status === 'rejected' ? partnersResult.reason : null
        })
      }

      if (!statsData && !ordersData && !partnersData) {
        toast.error('Failed to sync dashboard data')
      } else if (!partnersData) {
        toast.error('Delivery partner data failed to load')
      } else if (!statsData || !ordersData) {
        toast.error('Some dashboard data failed to load')
      }
    } catch (err) {
      console.error('Manager dashboard sync error:', err)
      toast.error('Failed to sync dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const filteredOrders = orders.filter(o => {
    if (!searchTerm) return true
    return matchesOrderIdQuery(o, searchTerm) ||
      (o.customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  })

  const handleViewOrder = (order) => {
    const id = order._id || order.id
    if (id) navigate(`${base}/orders/${id}`)
  }

  return (
    <div className="p-2 space-y-10 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Operation Control</h1>
          <p className="text-gray-400 font-bold mt-1 tracking-wider uppercase text-xs">Manager Dashboard Center</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="bg-gray-50 flex items-center gap-2 px-4 py-2 rounded-2xl border border-gray-100">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-black text-gray-900 tracking-widest uppercase">System Online</span>
           </div>
           <button 
             onClick={loadData}
             className="bg-black text-white px-6 py-2.5 rounded-2xl text-xs font-black shadow-xl shadow-black/10 hover:scale-[1.02] active:scale-95 transition-all"
           >
             REFRESH DATA
           </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Inventory" 
          value={stats.products} 
          icon={Package} 
          onClick={() => navigate(`${base}/products`)}
        />
        <StatCard 
          title="Total Order" 
          value={stats.orders} 
          icon={ShoppingCart} 
          onClick={() => navigate(`${base}/orders`)}
        />
        <StatCard 
          title="Customer Base" 
          value={stats.customers} 
          icon={Users} 
          onClick={() => navigate(`${base}/customers`)}
        />
        <StatCard 
          title="Delivery Partners Strength" 
          value={stats.partners} 
          icon={Truck} 
          onClick={() => navigate(`${base}/delivery-partners`)}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-8">
        {/* Core Operations (Orders) */}
        <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm p-8 flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
               <div className="bg-black text-white p-3 rounded-2xl">
                 <ShoppingCart size={20} />
               </div>
               <h2 className="text-xl font-black text-gray-900">Mission Orders</h2>
            </div>
            <div className="relative">
               <input 
                 type="text" 
                 placeholder="Search Order ID or Client" 
                 value={searchTerm}
                 onChange={e => setSearchTerm(e.target.value)}
                 className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-black outline-none w-64 transition-all"
               />
               <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto min-h-[400px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 grayscale opacity-20">
                <ShoppingCart size={48} className="animate-bounce" />
                <p className="text-xs font-black tracking-[0.2em] uppercase">Decrypting Stream...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 py-20">
                 <AlertCircle size={40} className="mb-4 opacity-10" />
                 <p className="text-sm font-bold">No orders found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredOrders.map(order => (
                  <OrderAssignmentRow 
                    key={order._id || order.id} 
                    order={order} 
                    partners={partners} 
                    onUpdate={loadData}
                    onViewOrder={handleViewOrder}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-50">
             <button 
               onClick={() => navigate(`${base}/orders`)}
               className="w-full flex items-center justify-center gap-2 py-4 bg-gray-50 hover:bg-black hover:text-white rounded-[1.5rem] text-xs font-black text-gray-900 transition-all group"
             >
               <span>LAUNCH FULL OPS PANEL</span>
               <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
             </button>
          </div>
        </div>
      </div>
    </div>

  )
}
