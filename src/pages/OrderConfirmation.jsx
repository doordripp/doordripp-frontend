import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { apiGet } from '../services/apiClient'

export default function OrderConfirmation() {
  const { id } = useParams()
  const loc = useLocation()
  const [order, setOrder] = useState(loc.state?.order || null)
  const [loading, setLoading] = useState(!order)
  const [error, setError] = useState('')

  useEffect(() => {
    if (order) return
    const load = async () => {
      setLoading(true)
      try {
        const data = await apiGet(`/orders/${id}`)
        setOrder(data)
      } catch (e) {
        setError(e?.error || e?.message || 'Failed to load order')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, order])

  if (loading) return <div className="p-8">Loading...</div>
  if (error) return <div className="p-8 text-red-600">{error}</div>
  if (!order) return <div className="p-8">Order not found.</div>

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <h1 className="text-2xl font-bold mb-2">Thank you — your order is placed!</h1>
          <p className="text-gray-600 mb-6">Order ID: <span className="font-mono text-sm">{order._id || order.id}</span></p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <h3 className="font-semibold mb-3">Items</h3>
              <div className="space-y-3">
                {(order.items || []).map(it => (
                  <div key={it.product?._id || it.product} className="flex items-center gap-3 bg-gray-50 p-3 rounded-md">
                    <div className="flex-1">
                      <div className="font-medium">{it.name}</div>
                      <div className="text-sm text-gray-600">Qty: {it.quantity}</div>
                    </div>
                    <div className="font-semibold">₹{(it.price * it.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Summary</h3>
              <div className="space-y-2 bg-gray-50 p-3 rounded-md">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{order.total?.toFixed(2)}</span></div>
                <div className="flex justify-between text-gray-600"><span>Status</span><span className="capitalize">{order.status}</span></div>
              </div>

              <Link to="/" className="mt-4 inline-block px-4 py-2 bg-black text-white rounded-lg">Continue shopping</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
