import { useEffect, useState } from 'react'
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom'
import { apiGet, apiPost } from '../services/apiClient'

export default function OrderConfirmation() {
  const { id } = useParams()
  const loc = useLocation()
  const [order, setOrder] = useState(loc.state?.order || null)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(!order)
  const [error, setError] = useState('')
  const [fetchedImages, setFetchedImages] = useState({})
  const [shareStatus, setShareStatus] = useState('')
  const [showReturnModal, setShowReturnModal] = useState(false)
  const [returnReason, setReturnReason] = useState('')
  const [returnStatus, setReturnStatus] = useState('')

  useEffect(() => {
    if (order) return
    const load = async () => {
      setLoading(true)
      try {
        const data = await apiGet(`/orders/${id}`)
        // backend may wrap order in object { order }
        const o = data?.order || data
        setOrder(o)
      } catch (e) {
        setError(e?.error || e?.message || 'Failed to load order')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, order])
  // Fetch missing product images when order has items without image
  useEffect(() => {
    if (!order || !order.items) return
    const missing = new Set()
    for (const it of order.items) {
      // try many possible fields
      const hasImage = it.image || it.imageUrl || it.imageURL || (it.product && (it.product.image || (it.product.images && it.product.images[0])))
      if (!hasImage) {
        const pid = (it.product && (typeof it.product === 'string' ? it.product : (it.product._id || it.product.id)))
        if (pid) missing.add(pid)
      }
    }
    if (missing.size === 0) return

    let mounted = true
    const fetchMap = async () => {
      const map = {}
      for (const pid of Array.from(missing)) {
        try {
          const p = await apiGet(`/products/${pid}`)
          const prod = p?.product || p || null
          if (prod) {
            const img = (prod.images && prod.images[0]) || prod.image || prod.thumbnail || prod.imageUrl || prod.imageURL || null
            if (img) map[pid] = img
          }
        } catch (e) {
          // ignore fetch error for this product
        }
      }
      if (mounted && Object.keys(map).length) {
        setFetchedImages(prev => ({ ...prev, ...map }))
      }
    }
    fetchMap()
    return () => { mounted = false }
  }, [order])

  if (loading) return <div className="p-8">Loading...</div>
  if (error) return <div className="p-8 text-red-600">{error}</div>
  if (!order) return <div className="p-8">Order not found.</div>
  const placedAt = order.createdAt ? new Date(order.createdAt) : (order.placedAt ? new Date(order.placedAt) : null)

  const formatCurrency = (v) => {
    if (v == null) return '₹0.00'
    try { return `₹${Number(v).toFixed(2)}` } catch { return `₹${v}` }
  }

  const downloadInvoice = async () => {
    try {
      const orderId = order._id || order.id
      if (!orderId) return

      const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'
      const invoiceData = await apiGet(`/invoices/order/${orderId}`)
      const invoiceId = invoiceData?.invoice?._id
      if (!invoiceId) {
        setError('Invoice not found for this order')
        return
      }

      const res = await fetch(`${API_BASE}/invoices/${invoiceId}/download`, {
        credentials: 'include'
      })
      if (!res.ok) {
        setError('Failed to download invoice')
        return
      }

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Invoice-${invoiceData.invoice.invoiceNumber || orderId}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      setError(e?.error || e?.message || 'Failed to download invoice')
    }
  }
  

  // Share tracking and return/replace handlers
  const handleShare = async () => {
    try {
      const url = window.location.href
      if (navigator.share) {
        await navigator.share({ title: 'My Order', text: `Order ${order._id || order.id}`, url })
      } else {
        await navigator.clipboard.writeText(url)
      }
      // try to POST a lightweight analytics event; ignore failures
      try { await apiPost('/events/share', { type: 'order', id: order._id || order.id }) } catch (e) { /* ignore */ }
      setShareStatus('Shared')
      setTimeout(() => setShareStatus(''), 3000)
    } catch (e) {
      setShareStatus('Failed')
      setTimeout(() => setShareStatus(''), 3000)
    }
  }

  const submitReturnRequest = async () => {
    setReturnStatus('sending')
    try {
      // backend may not have this endpoint; call and handle errors gracefully
      await apiPost(`/orders/${order._id || order.id}/return`, { reason: returnReason })
      setReturnStatus('requested')
      setShowReturnModal(false)
    } catch (e) {
      setReturnStatus('failed')
      // still close modal after a moment
      setTimeout(() => setShowReturnModal(false), 1500)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="bg-white rounded-2xl shadow p-8 border border-gray-100">
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0 w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-7.364 7.364a1 1 0 01-1.414 0L3.293 8.364a1 1 0 011.414-1.414l3.293 3.293 6.657-6.657a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Thank you — your order is confirmed</h1>
              <p className="text-sm text-gray-600 mt-1">We've received your order and will send updates to your email.</p>
              <div className="mt-3 text-sm text-gray-700">
                <div>Order ID: <span className="font-mono text-sm">{order._id || order.id}</span></div>
                {placedAt && <div>Placed on: <span className="text-gray-600">{placedAt.toLocaleString()}</span></div>}
              </div>
            </div>
            <div className="ml-auto text-right">
              <button
                onClick={() => navigate(`/orders/${order._id || order.id}`, { state: { order } })}
                className="inline-block text-sm bg-white border px-3 py-2 rounded-md shadow-sm"
              >
                View order
              </button>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Items in your order</h3>
                <div className="divide-y">
                  {(order.items || []).map((it, idx) => {
                    const prod = it.product || {}
                    const thumb = (prod.images && prod.images[0]) || it.image || prod.image || ''
                    return (
                      <div key={it._id || it.product || idx} className="flex items-center gap-4 py-4">
                            <div className="w-20 h-20 bg-white rounded overflow-hidden flex-shrink-0 border">
                              {thumb || (it.product && typeof it.product === 'string' && fetchedImages[it.product]) || (it.product && it.product._id && fetchedImages[it.product._id]) ? (
                                <img src={thumb || fetchedImages[it.product] || fetchedImages[it.product?._id]} alt={it.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-sm text-gray-400">No image</div>
                              )}
                            </div>
                        <div className="flex-1">
                          <div className="font-medium">{it.name || prod.name}</div>
                          {prod.seller && <div className="text-xs text-gray-500">Sold by {prod.seller}</div>}
                          <div className="text-sm text-gray-600 mt-1">Qty: {it.quantity} • {formatCurrency(it.price)}</div>
                        </div>
                        <div className="text-right font-semibold">{formatCurrency((it.price || 0) * (it.quantity || 1))}</div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="mt-6 bg-white border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Shipping</h4>
                <div className="text-sm text-gray-700">
                  <div>{order.shippingAddress ? [order.shippingAddress.street, order.shippingAddress.city, order.shippingAddress.state, order.shippingAddress.zip].filter(Boolean).join(', ') : (order.address || 'No shipping address')}</div>
                  <div className="mt-2 text-xs text-gray-500">Estimated delivery: <strong>{order.estimatedDelivery || '20-30 min'}</strong></div>
                </div>
              </div>
            </div>

            <aside>
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-semibold mb-3">Order summary</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(order.subtotal || order.total)}</span></div>
                  <div className="flex justify-between"><span>Shipping</span><span>{formatCurrency(order.shipping || 0)}</span></div>
                  <div className="flex justify-between"><span>Tax</span><span>{formatCurrency(order.tax || 0)}</span></div>
                  <div className="flex justify-between font-semibold text-gray-900"><span>Total</span><span>{formatCurrency(order.total)}</span></div>
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  <button onClick={() => window.location.assign('/')} className="w-full px-4 py-2 bg-black text-white rounded-md">Continue shopping</button>
                  <Link to={`/orders/${order._id || order.id}`} className="w-full text-center px-4 py-2 border rounded-md">Track order</Link>
                  <button onClick={downloadInvoice} className="w-full px-4 py-2 bg-white border rounded-md">Download invoice</button>
                  <button onClick={handleShare} className="w-full px-4 py-2 bg-white border rounded-md">Share order {shareStatus && <span className="ml-2 text-sm text-gray-500">{shareStatus}</span>}</button>
                  <button onClick={() => setShowReturnModal(true)} className="w-full px-4 py-2 bg-red-50 text-red-700 border rounded-md">Request return / replace</button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
      {showReturnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowReturnModal(false)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg p-6 z-10">
            <h3 className="text-lg font-semibold mb-2">Request return / replace</h3>
            <p className="text-sm text-gray-600 mb-3">Tell us why you'd like to return or replace this order. Our support team will contact you.</p>
            <textarea value={returnReason} onChange={e => setReturnReason(e.target.value)} placeholder="Reason for return or replacement" className="w-full border rounded-md p-2 h-28" />
            <div className="mt-4 flex items-center justify-end gap-2">
              <button className="px-4 py-2 border rounded-md" onClick={() => setShowReturnModal(false)}>Cancel</button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-md" onClick={submitReturnRequest}>{returnStatus === 'sending' ? 'Sending...' : 'Submit request'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Modal is rendered inside component via state - add here to keep file organized

// Return modal markup appended outside main component return to avoid hooks issues
// (we render it conditionally within the component's JSX using state)
