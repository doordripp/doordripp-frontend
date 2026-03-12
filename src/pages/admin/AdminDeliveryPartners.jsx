import React, { useEffect, useState } from 'react'
import adminAPI from '../../services/adminAPI'
import managerAPI from '../../services/managerAPI'
import { Search, Plus, Truck, X, Eye, Trash2, Edit2, Calendar, Package, Clipboard, User as UserIcon } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { getOrderDisplayId } from '../../utils/orderUtils'

const getPartnerCapacity = (partner) => Math.max(Number(partner?.deliveryPartner?.maxOrdersPerSlot) || 0, 10)
const getPartnerLoad = (partner) => Number(partner?.deliveryPartner?.currentLoad) || 0

function AddPartnerModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ 
    name: '', email: '', password: '', phone: '',
    vehicleType: 'Bike', licenseNumber: '', accountNumber: '',
    assignedArea: ''
  })
  const [zones, setZones] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadZones = async () => {
      try {
        const res = await adminAPI.getDeliveryZones({ isActive: true })
        setZones(res.zones || [])
      } catch (err) {
        // Silent fail; zone selection is optional in UI but recommended
        setZones([])
      }
    }
    loadZones()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) {
      toast.error('Name, email and password are required')
      return
    }
    try {
      setLoading(true)
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        vehicleType: form.vehicleType,
        licenseNumber: form.licenseNumber,
        accountNumber: form.accountNumber,
        assignedArea: form.assignedArea || undefined
      }
      await managerAPI.createDeliveryPartner(payload)
      toast.success('Delivery partner created/updated')
      onCreated()
      onClose()
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to create delivery partner')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Add Delivery Partner</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Full Name *</label>
              <input type="text" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-black focus:bg-white transition-all outline-none" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Email Address *</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-black focus:bg-white transition-all outline-none" placeholder="john@example.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Phone Number</label>
              <input type="text" value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-black focus:bg-white transition-all outline-none" placeholder="+1234567890" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Password *</label>
              <input type="password" value={form.password} onChange={e => setForm(p => ({...p, password: e.target.value}))}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-black focus:bg-white transition-all outline-none" placeholder="••••••••" />
            </div>
            
            <div className="pt-2 col-span-2">
              <div className="h-px bg-gray-100 w-full mb-4" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Vehicle Type</label>
              <select value={form.vehicleType} onChange={e => setForm(p => ({...p, vehicleType: e.target.value}))}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-black focus:bg-white transition-all outline-none">
                <option value="Bike">Bike</option>
                <option value="Scooter">Scooter</option>
                <option value="Car">Car</option>
                <option value="Van">Van</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">License Number</label>
              <input type="text" value={form.licenseNumber} onChange={e => setForm(p => ({...p, licenseNumber: e.target.value}))}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-black focus:bg-white transition-all outline-none" placeholder="ABC-12345" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Account Number (Payment)</label>
              <input type="text" value={form.accountNumber} onChange={e => setForm(p => ({...p, accountNumber: e.target.value}))}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-black focus:bg-white transition-all outline-none" placeholder="Bank A/C or UPI" />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Assigned Delivery Zone</label>
              <select
                value={form.assignedArea}
                onChange={e => setForm(p => ({ ...p, assignedArea: e.target.value }))}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-black focus:bg-white transition-all outline-none"
              >
                <option value="">Select a zone (recommended)</option>
                {zones.map(z => (
                  <option key={z._id} value={z._id}>{z.name}</option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-gray-500">
                Link this rider to a delivery zone so new orders in that area can be auto-assigned.
              </p>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-3 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" disabled={loading}
              className="flex-1 px-6 py-3 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-900 disabled:opacity-50 shadow-lg shadow-black/10 transition-all flex items-center justify-center gap-2">
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : <Plus size={18} />}
              {loading ? 'Creating...' : 'Create Partner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function PartnerDetailsModal({ partner: initialPartner, onClose, onUpdate }) {
  const [partner, setPartner] = useState(initialPartner)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState(initialPartner)
  const [assignOrderId, setAssignOrderId] = useState('')
  const [assigning, setAssigning] = useState(false)

  const loadDetails = async () => {
    try {
      setLoading(true)
      const data = await managerAPI.getDeliveryPartner(partner._id || partner.id)
      setPartner(data.user)
      setOrders(data.orders || [])
      setEditForm(data.user)
    } catch (err) {
      toast.error('Failed to load partner details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadDetails() }, [])

  const handleUpdateDetails = async (e) => {
    e.preventDefault()
    try {
      await managerAPI.updateDeliveryPartner(partner._id || partner.id, editForm)
      toast.success('Partner details updated')
      setEditMode(false)
      loadDetails()
      onUpdate()
    } catch (err) {
      toast.error('Failed to update details')
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to remove this delivery partner? This will revoke their access.')) return
    try {
      await managerAPI.deleteDeliveryPartner(partner._id || partner.id)
      toast.success('Partner removed')
      onUpdate()
      onClose()
    } catch (err) {
      toast.error('Failed to remove partner')
    }
  }

  const handleAssignOrder = async (e) => {
    e.preventDefault()
    const normalizedOrderId = assignOrderId.trim()
    if (!normalizedOrderId) return
    try {
      setAssigning(true)
      await managerAPI.assignOrder(partner._id || partner.id, normalizedOrderId)
      toast.success('Order assigned successfully')
      setAssignOrderId('')
      loadDetails()
      onUpdate()
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to assign order')
    } finally {
      setAssigning(false)
    }
  }

  const handleUnassignOrder = async (orderId) => {
    if (!window.confirm('Remove this order from partner?')) return
    try {
      await managerAPI.unassignOrder(partner._id || partner.id, orderId)
      toast.success('Order unassigned')
      loadDetails()
      onUpdate()
    } catch (err) {
      toast.error('Failed to unassign order')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="bg-black text-white p-2 rounded-xl">
              <UserIcon size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{partner.name}</h2>
              <p className="text-sm text-gray-500">{partner.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setEditMode(!editMode)} className={`p-2 rounded-xl transition-colors ${editMode ? 'bg-black text-white' : 'hover:bg-gray-100'}`}>
              <Edit2 size={20} />
            </button>
            <button onClick={handleDelete} className="p-2 hover:bg-red-50 text-red-600 rounded-xl transition-colors">
              <Trash2 size={20} />
            </button>
            <div className="w-px h-6 bg-gray-200 mx-1" />
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X size={24} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Detailed Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {editMode ? (
                <form onSubmit={handleUpdateDetails} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">Edit Basic Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="text-xs font-semibold text-gray-500 mb-1 block">Full Name</label>
                      <input type="text" value={editForm.name} onChange={e => setEditForm(p => ({...p, name: e.target.value}))}
                        className="w-full px-4 py-2 border rounded-xl text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1 block">Phone</label>
                      <input type="text" value={editForm.phone} onChange={e => setEditForm(p => ({...p, phone: e.target.value}))}
                        className="w-full px-4 py-2 border rounded-xl text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1 block">Vehicle Type</label>
                      <select value={editForm.deliveryPartner?.vehicleType} 
                        onChange={e => setEditForm(p => ({...p, deliveryPartner: {...p.deliveryPartner, vehicleType: e.target.value}}))}
                        className="w-full px-4 py-2 border rounded-xl text-sm focus:ring-0">
                        <option value="Bike">Bike</option>
                        <option value="Scooter">Scooter</option>
                        <option value="Car">Car</option>
                        <option value="Van">Van</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1 block">License Number</label>
                      <input type="text" value={editForm.deliveryPartner?.licenseNumber} 
                        onChange={e => setEditForm(p => ({...p, deliveryPartner: {...p.deliveryPartner, licenseNumber: e.target.value}}))}
                        className="w-full px-4 py-2 border rounded-xl text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1 block">Account Number</label>
                      <input type="text" value={editForm.deliveryPartner?.accountNumber} 
                        onChange={e => setEditForm(p => ({...p, deliveryPartner: {...p.deliveryPartner, accountNumber: e.target.value}}))}
                        className="w-full px-4 py-2 border rounded-xl text-sm" />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button type="submit" className="bg-black text-white px-4 py-2 rounded-xl text-sm font-bold">Save Changes</button>
                    <button type="button" onClick={() => setEditMode(false)} className="px-4 py-2 border rounded-xl text-sm font-bold">Cancel</button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <span className="text-xs font-semibold text-gray-400 uppercase">Vehicle</span>
                    <p className="font-bold text-gray-900 mt-1">{partner.deliveryPartner?.vehicleType || 'Not Set'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <span className="text-xs font-semibold text-gray-400 uppercase">License No.</span>
                    <p className="font-bold text-gray-900 mt-1">{partner.deliveryPartner?.licenseNumber || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <span className="text-xs font-semibold text-gray-400 uppercase">Load Balance</span>
                    <p className="font-bold text-gray-900 mt-1">{getPartnerLoad(partner)} / {getPartnerCapacity(partner)} Orders</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <span className="text-xs font-semibold text-gray-400 uppercase">Phone</span>
                    <p className="font-bold text-gray-900 mt-1">{partner.phone || 'N/A'}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
                <h3 className="text-sm font-bold text-amber-900 mb-4 flex items-center gap-2">
                   <Clipboard size={16} /> Assign New Order
                </h3>
                <form onSubmit={handleAssignOrder} className="space-y-3">
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Enter full or short Order ID" 
                      value={assignOrderId}
                      onChange={e => setAssignOrderId(e.target.value)}
                      className="w-full pl-4 pr-10 py-3 bg-white border border-amber-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <Package size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400" />
                  </div>
                  <button 
                    disabled={assigning || !assignOrderId}
                    className="w-full bg-amber-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-amber-600/20 hover:bg-amber-700 disabled:opacity-50 transition-all"
                  >
                    {assigning ? 'Assigning...' : 'Assign to Partner'}
                  </button>
                </form>
              </div>

              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                 <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                   <Calendar size={16} /> Working Hours
                 </h3>
                 <p className="text-sm text-gray-600">{partner.deliveryPartner?.workingHours || '9 AM - 5 PM'}</p>
                 <div className="mt-3 flex flex-wrap gap-1">
                    {(partner.deliveryPartner?.availabilitySlots || []).map(s => (
                      <span key={s} className="bg-white px-2 py-1 rounded-lg text-[10px] font-bold text-gray-500 shadow-sm">{s}</span>
                    ))}
                 </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
               <Package size={20} /> Assigned Orders ({orders.length})
            </h3>
            {loading ? (
              <div className="py-12 text-center text-gray-400 font-medium">Syncing order data...</div>
            ) : orders.length === 0 ? (
              <div className="py-12 bg-gray-50 rounded-3xl text-center border-2 border-dashed border-gray-200">
                <p className="text-gray-400 font-medium">No orders currently assigned</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {orders.map(order => (
                  <div key={order._id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between group">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">{getOrderDisplayId(order)}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {order.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-gray-900 truncate">{order.customer?.name || order.customer || order.shippingAddress?.name || 'Customer'}</p>
                      <p className="text-xs text-gray-500">Scheduled: {new Date(order.createdAt || order.date).toLocaleDateString()}</p>
                    </div>
                    <button 
                      onClick={() => handleUnassignOrder(order._id)}
                      className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                      title="Unassign Order"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminDeliveryPartners() {
  const [partners, setPartners] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [selectedPartner, setSelectedPartner] = useState(null)

  const loadPartners = async () => {
    try {
      setLoading(true)
      const data = await managerAPI.getDeliveryPartners()
      setPartners(data.users || [])
    } catch (err) {
      toast.error('Failed to load partners')
      setPartners([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadPartners() }, [])

  const filtered = partners.filter(p => {
    if (!searchTerm) return true
    const q = searchTerm.toLowerCase()
    return (p.name || '').toLowerCase().includes(q) ||
           (p.email || '').toLowerCase().includes(q) ||
           (p.phone || '').toLowerCase().includes(q)
  })

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="bg-black text-white p-3 rounded-2xl shadow-xl shadow-black/10">
            <Truck size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Delivery Squad</h1>
            <p className="text-gray-500 font-medium">Real-time logistics management</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-4 focus:ring-black/5 focus:border-black outline-none w-full md:w-80 transition-all font-medium"
            />
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-gray-800 transition-all shadow-lg shadow-black/20 hover:scale-[1.02] active:scale-95"
          >
            <Plus size={20} />
            <span>Add Talent</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 grayscale opacity-30">
            <Truck size={48} className="animate-bounce" />
            <p className="mt-4 font-black uppercase tracking-widest">Coordinating Fleet...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full text-center bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200 py-20">
             <Package size={40} className="mx-auto text-gray-300 mb-4" />
             <p className="text-gray-400 font-bold">No active delivery partners matching your criteria</p>
          </div>
        ) : (
          filtered.map(p => (
            <div 
              key={p._id || p.id} 
              onClick={() => setSelectedPartner(p)}
              className="group bg-white rounded-3xl border border-gray-200 p-6 hover:border-black hover:shadow-2xl hover:shadow-black/5 transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-all">
                <div className="bg-black text-white p-2 rounded-xl">
                  <Eye size={16} />
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-900 group-hover:bg-black group-hover:text-white transition-colors duration-300 overflow-hidden">
                  {p.avatar ? (
                    <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                  ) : <Truck size={24} />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-lg group-hover:text-black transition-colors truncate">{p.name}</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter truncate">{p.email}</p>
                  <p className="text-xs font-semibold text-gray-900 mt-1">{p.deliveryPartner?.vehicleType || 'Bike'} • {p.phone || 'No Phone'}</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-50 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Current Load</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-black transition-all duration-1000" 
                        style={{ width: `${Math.min((getPartnerLoad(p) / getPartnerCapacity(p)) * 100, 100)}%` }} 
                      />
                    </div>
                    <span className="text-xs font-black text-gray-900">{getPartnerLoad(p)} / {getPartnerCapacity(p)}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Efficiency</span>
                  <p className="text-xs font-black text-gray-900 mt-1">4.9 / 5.0 ⭐</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                 <div className="flex flex-wrap gap-1">
                    {(p.roles || []).map(role => (
                      <span key={role} className="bg-gray-50 text-gray-400 font-bold text-[9px] px-2 py-0.5 rounded-lg border border-gray-100">{role.toUpperCase()}</span>
                    ))}
                 </div>
                 <span className={`text-[10px] font-black px-3 py-1 rounded-xl shadow-sm ${
                    p.isBanned || p.blocked ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'
                  }`}>
                    {p.isBanned || p.blocked ? 'BLOCKED' : 'ACTIVE'}
                 </span>
              </div>
            </div>
          ))
        )}
      </div>

      {showAdd && <AddPartnerModal onClose={() => setShowAdd(false)} onCreated={loadPartners} />}
      {selectedPartner && (
        <PartnerDetailsModal 
          partner={selectedPartner} 
          onClose={() => setSelectedPartner(null)} 
          onUpdate={loadPartners} 
        />
      )}
    </div>
  )
}
