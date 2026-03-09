import { useEffect, useState } from 'react'
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom'
import { apiGet, apiPost } from '../services/apiClient'
import InvoiceViewer from '../components/invoices/InvoiceViewer'
import { transformOrderToInvoice, transformInvoiceApiToTemplate } from '../components/invoices/invoice-utils'
import CompactOrderTracking from '../components/tracking/CompactOrderTracking'

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
  const [invoiceData, setInvoiceData] = useState(null)
  const [showInvoice, setShowInvoice] = useState(false)
  const [invoiceLoading, setInvoiceLoading] = useState(false)

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

  const formatCurrency = (value) => {
    const amount = Number(value ?? 0)
    if (Number.isNaN(amount)) return 'INR 0.00'
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount)
  }

  const subtotal = Number(order.subtotal || 0)
  const deliveryFee = Number(order.deliveryFee || 0)
  const trialFee = Number(order.trialFee || 0)
  const voucherDiscount = Number(order.voucherDiscount || order.voucher?.discountAmount || 0)
  const voucherCode = order.voucher?.code || order.voucherCode || ''
  const payableTotal = Number(order.total != null ? order.total : Math.max(0, subtotal + deliveryFee + trialFee - voucherDiscount))

  const downloadInvoice = async () => {
    try {
      const orderId = order._id || order.id
      if (!orderId) return
      setInvoiceLoading(true)

      let nextInvoiceData = null
      try {
        let invoiceResponse = await apiGet(`/invoices/order/${orderId}`)
        if (!invoiceResponse?.invoice) {
          await apiPost(`/invoices/generate/${orderId}`)
          invoiceResponse = await apiGet(`/invoices/order/${orderId}`)
        }

        if (invoiceResponse?.invoice) {
          nextInvoiceData = transformInvoiceApiToTemplate(
            invoiceResponse.invoice,
            invoiceResponse.items,
            order
          )
        }
      } catch (e) {
        // fall back to order-only transformation
      }

      if (!nextInvoiceData) {
        nextInvoiceData = transformOrderToInvoice(order)
      }

      if (!nextInvoiceData) {
        setError('Invoice data not available')
        return
      }

      setInvoiceData(nextInvoiceData)
      setShowInvoice(true)
    } catch (e) {
      setError(e?.error || e?.message || 'Failed to download invoice')
    } finally {
      setInvoiceLoading(false)
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
              <h1 className="text-2xl font-bold">Thank you - your order is confirmed</h1>
              <p className="text-sm text-gray-600 mt-1">We've received your order and will send updates to your email.</p>
              <div className="mt-3 text-sm text-gray-700">
                <div>Order ID: <span className="font-mono text-sm">{order._id || order.id}</span></div>
                {placedAt && <div>Placed on: <span className="text-gray-600">{placedAt.toLocaleString()}</span></div>}
              </div>
              {voucherDiscount > 0 && (
                <div className="mt-2 text-sm text-green-700">
                  Coupon {voucherCode ? <span className="font-semibold">{voucherCode}</span> : 'applied'} - you saved {formatCurrency(voucherDiscount)} on subtotal.
                </div>
              )}
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
              {order.isTrial && order.trialItems && order.trialItems.length > 0 && (
                <div className="bg-black/5 p-4 rounded-lg mb-6 border border-black/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold">Trial Room Package</h3>
                    <span className="text-[10px] font-bold bg-black text-white px-2 py-0.5 rounded-full uppercase tracking-tighter">
                      Trial & Buy Mode
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {order.trialItems.map((ti, idx) => {
                      const isPurchased = order.items.some(it => {
                        const itProdId = it.product?._id || it.product;
                        const tiProdId = ti.product?._id || ti.product;
                        return String(itProdId) === String(tiProdId);
                      });
                      return (
                        <div key={ti._id || ti.product || idx} className={`bg-white p-3 rounded-xl border-2 transition-all ${isPurchased ? 'border-black shadow-md relative overflow-hidden' : 'border-dashed border-gray-200 opacity-60'}`}>
                          {isPurchased && (
                            <div className="absolute top-0 right-0 bg-black text-white text-[8px] font-bold px-2 py-0.5 transform rotate-0 rounded-bl-lg">
                              PURCHASED
                            </div>
                          )}
                          <img src={ti.image} alt={ti.name} className="w-full h-24 object-cover rounded-lg mb-2" />
                          <div className="text-[10px] font-bold truncate mb-1">{ti.name}</div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black">{formatCurrency(ti.price)}</span>
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${isPurchased ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                              {isPurchased ? 'Main Item' : 'Trial Item'}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <p className="mt-4 text-[10px] text-gray-500 italic text-center border-t border-gray-200 pt-3">
                    Try all items at home. Keep the purchased one, returns for others are free!
                  </p>
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">{order.isTrial ? 'Purchased Item (Final Invoice)' : 'Items in your order'}</h3>
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
                          <div className="text-sm text-gray-600 mt-1">Qty: {it.quantity} x {formatCurrency(it.price)}</div>
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
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  
                  {order.trialFee > 0 && (
                    <div className="flex justify-between">
                      <div className="flex flex-col">
                        <span>Trial Service Fee</span>
                        <span className="text-[10px] text-gray-400">Doorstep trial & returns</span>
                      </div>
                      <span>{formatCurrency(trialFee)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Shipping ({order.deliveryType || 'Standard'})</span>
                    <span className="text-green-600 font-medium">{formatCurrency(deliveryFee)}</span>
                  </div>


                  {voucherDiscount > 0 && (
                    <div className="flex justify-between text-green-700">
                      <span>Coupon {voucherCode ? `(${voucherCode})` : ''}</span>
                      <span>-{formatCurrency(voucherDiscount)}</span>
                    </div>
                  )}
                  <div className="pt-3 border-t border-gray-100 flex justify-between font-black text-gray-900 text-lg">
                    <span>{voucherDiscount > 0 ? 'Payable Total' : 'Grand Total'}</span>
                    <span>{formatCurrency(payableTotal)}</span>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3">
                  {/* Live Tracking Widget */}
                  {order.deliveryPartner?.riderId && (
                    <div>
                      <CompactOrderTracking 
                        orderId={order._id || order.id} 
                        token={localStorage.getItem('token')}
                      />
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <button onClick={() => window.location.assign('/')} className="w-full px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition">Continue shopping</button>
                  
                  <Link to={`/order/${order._id || order.id}/track`} className="w-full text-center px-4 py-2 bg-white text-gray-900 border rounded-md hover:bg-gray-50 transition font-semibold">
                    Track Order
                  </Link>
                  
                  <button onClick={downloadInvoice} className="w-full px-4 py-2 bg-white border rounded-md hover:bg-gray-50 transition">
                    {invoiceLoading ? 'Preparing invoice...' : 'Download invoice'}
                  </button>
                  
                  <button onClick={handleShare} className="w-full px-4 py-2 bg-white border rounded-md hover:bg-gray-50 transition">Share order {shareStatus && <span className="ml-2 text-sm text-gray-500">{shareStatus}</span>}</button>
                  
                  <button onClick={() => setShowReturnModal(true)} className="w-full px-4 py-2 bg-red-50 text-red-700 border rounded-md hover:bg-red-100 transition">Request return / replace</button>
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
      {showInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowInvoice(false)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-auto z-10">
            <div className="flex justify-end p-3 border-b">
              <button className="px-3 py-1 text-sm border rounded-md" onClick={() => setShowInvoice(false)}>Close</button>
            </div>
            <div className="p-4">
              {invoiceData ? (
                <InvoiceViewer invoiceData={invoiceData} />
              ) : (
                <div className="p-6">Loading invoice...</div>
              )}
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





