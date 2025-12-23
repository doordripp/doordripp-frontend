import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { apiPost, apiPut } from '../services/apiClient'
import addressIllustration from '../assets/map.png'

export default function Checkout() {
  const { items, cartTotals, clearCart } = useCart()
  const { user, fetchMe } = useAuth()
  const navigate = useNavigate()

  // support a single saved address (from profile) and a modal to add/edit it
  const [address, setAddress] = useState(user?.address || {
    name: user?.name || '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    zip: '',
    phone: user?.phone || ''
  })
  const [selectedAddress, setSelectedAddress] = useState(address)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState('')

  const hasItems = items && items.length > 0

  // Local persistence key so selected address survives page refresh
  const LOCAL_CHECKOUT_ADDRESS_KEY = 'checkout_selected_address_v1'

  const currentUserId = user?._id || user?.id || null
  const isValidField = v => typeof v === 'string' && v.trim().length > 0
  const validateAddress = (a) => {
    if (!a) return ['address']
    const missing = []
    if (!isValidField(a.line1)) missing.push('Address line 1')
    if (!isValidField(a.city)) missing.push('City')
    if (!isValidField(a.state)) missing.push('State')
    if (!isValidField(a.zip)) missing.push('ZIP')
    if (!isValidField(a.phone)) missing.push('Phone')
    return missing
  }

  // Load persisted address (localStorage) or sync with user profile on mount/user change
  // Store local address along with userId to avoid leaking one user's address to another
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_CHECKOUT_ADDRESS_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        // parsed shape: { userId, address }
        if (parsed && parsed.userId && parsed.userId === currentUserId) {
          setAddress(parsed.address)
          setSelectedAddress(parsed.address)
          return
        }
        // If stored address belongs to different user, clear it so it doesn't persist across accounts
        localStorage.removeItem(LOCAL_CHECKOUT_ADDRESS_KEY)
      }
    } catch (e) {
      // ignore parse errors
    }

    // If user has an address in profile, use it
    if (user?.address) {
      setAddress(user.address)
      setSelectedAddress(user.address)
      return
    }

    // No stored or profile address: reset local state when user changes
    setAddress({ name: user?.name || '', line1: '', line2: '', city: '', state: '', zip: '', phone: user?.phone || '' })
    setSelectedAddress(null)
  }, [user, currentUserId])

  // Keep localStorage updated when selectedAddress or address changes.
  // Save with the current userId so address isn't re-used by another account.
  useEffect(() => {
    const toSave = selectedAddress || address
    try {
      if (toSave && toSave.line1) {
        const payload = { userId: currentUserId, address: toSave }
        localStorage.setItem(LOCAL_CHECKOUT_ADDRESS_KEY, JSON.stringify(payload))
      }
    } catch (e) {
      // ignore storage errors (e.g., denied)
    }
  }, [selectedAddress, address, currentUserId])

  const handleSaveAddress = async () => {
    setError('')
    // Validate address fields before saving
    const missing = validateAddress(address)
    if (missing.length) {
      setError('Please complete address: ' + missing.join(', '))
      return
    }
    setSaving(true)
    try {
      // persist address (includes phone)
      await apiPut('/auth/profile', { address })
      await fetchMe()
      setSelectedAddress(address)
      // persist locally with userId so it's scoped to this user
      try { localStorage.setItem(LOCAL_CHECKOUT_ADDRESS_KEY, JSON.stringify({ userId: currentUserId, address })) } catch (e) { /* ignore */ }
      setShowAddressModal(false)
    } catch (e) {
      setError(e?.error || e?.message || 'Failed to save address')
    } finally {
      setSaving(false)
    }
  }

  const handlePlaceOrder = async () => {
    if (!hasItems) return
    if (!user) {
      navigate('/login', { state: { from: '/checkout' } })
      return
    }
    // Ensure a valid shipping address exists before initiating payment
    const shipCheck = selectedAddress || address
    const missing = validateAddress(shipCheck)
    if (missing.length) {
      setError('Please provide a valid delivery address before placing the order.')
      // open address modal to help user quickly fix address
      setAddress(shipCheck || { name: user?.name || '', line1: '', line2: '', city: '', state: '', zip: '', phone: user?.phone || '' })
      setShowAddressModal(true)
      return
    }
    setPlacing(true)
    setError('')
    try {
      const ship = selectedAddress || address
      const payload = {
        items: items.map(i => ({ product: i.id, quantity: i.quantity })),
        shippingAddress: ship
      }
      const res = await apiPost('/orders', payload)
      const orderId = res?.order?._id || res?.order?.id
      const razorOrder = res?.razorOrder
      
      // Initialize Razorpay payment
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID
      
      if (!razorpayKey) {
        console.error('❌ Razorpay key not configured in environment')
        setError('Payment system not configured')
        setPlacing(false)
        return
      }
      
      if (razorOrder && window.Razorpay) {
        try {
          console.log('✅ Initializing Razorpay with order:', razorOrder.id)
          const options = {
            key: razorpayKey,
            order_id: razorOrder.id,
            amount: razorOrder.amount,
            currency: 'INR',
            name: 'DOORDRIPP',
            description: 'Order Payment',
            handler: async (response) => {
              // Payment successful - verify signature
              try {
                console.log('✅ Payment handler called, verifying signature...')
                const verifyRes = await apiPost(`/orders/${orderId}/verify-payment`, {
                  orderId,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature
                })
                console.log('✅ Payment verified successfully')
                clearCart()
                navigate(`/orders/${orderId}`, { state: { order: verifyRes.order } })
              } catch (verifyErr) {
                console.error('❌ Payment verification failed:', verifyErr)
                setError('Payment verification failed: ' + (verifyErr?.message || 'Unknown error'))
                setPlacing(false)
              }
            },
            modal: {
              ondismiss: () => {
                console.log('⚠️ Payment modal dismissed by user')
                setPlacing(false)
              }
            },
            prefill: {
              name: user?.name || '',
              email: user?.email || '',
              contact: user?.phone || ''
            }
          }
          console.log('✅ Opening Razorpay checkout...')
          const rzp = new window.Razorpay(options)
          rzp.open()
        } catch (rzpErr) {
          console.error('❌ Razorpay error:', rzpErr)
          setError('Failed to open payment gateway: ' + (rzpErr?.message || 'Unknown error'))
          setPlacing(false)
        }
      } else {
        // Fallback: navigate to order confirmation (Razorpay not available)
        console.warn('⚠️ Razorpay not available, using fallback', { razorOrder, razorpayAvailable: !!window.Razorpay })
        clearCart()
        navigate(`/orders/${orderId}`, { state: { order: res.order, razorOrder } })
      }
    } catch (e) {
      setError(e?.error || e?.message || 'Failed to place order')
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4">
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li><Link to="/" className="hover:text-gray-700">Home</Link></li>
            <li className="before:content-['>'] before:mx-2">Checkout</li>
          </ol>
        </nav>

        <h1 className="text-3xl font-bold mb-6">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Select Delivery Address</h2>
                <button onClick={() => { setAddress({ name: user?.name || '', line1: '', line2: '', city: '', state: '', zip: '', phone: user?.phone || '' }); setShowAddressModal(true) }} className="px-3 py-2 text-sm font-medium text-blue-600 border border-blue-100 rounded-md">+ADD NEW ADDRESS</button>
              </div>

              {/* If no address show empty state */}
              {(!selectedAddress || !selectedAddress.line1) ? (
                <div className="p-8 text-center border rounded-xl bg-white shadow-sm">
                  <div className="mx-auto w-40 h-40 flex items-center justify-center mb-6 bg-white rounded-full overflow-hidden">
                    <img src={addressIllustration} alt="no addresses" className="w-full h-full object-contain" />
                  </div>
                  <h3 className="text-lg font-semibold">No Addresses found in your account!</h3>
                  <p className="text-sm text-gray-500 mb-4">Add a delivery address.</p>
                  <button onClick={() => { setAddress({ name: user?.name || '', line1: '', line2: '', city: '', state: '', zip: '', phone: user?.phone || '' }); setShowAddressModal(true) }} className="px-6 py-2 rounded-lg bg-black text-white font-semibold hover:bg-gray-800">ADD ADDRESS</button>
                </div>
              ) : (
                <div className="p-4">
                  <label className="block bg-red-50 border border-red-100 rounded-xl p-4 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <input type="radio" name="selectedAddress" checked={true} onChange={() => setSelectedAddress(selectedAddress)} className="mt-1 accent-red-500 w-4 h-4" />
                        <div>
                          <div className="inline-flex items-center gap-2 mb-1">
                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-md">Home</span>
                            <span className="font-semibold">{selectedAddress.name}</span>
                          </div>
                          <div className="text-sm text-gray-700">{[selectedAddress.line1, selectedAddress.line2, selectedAddress.city, selectedAddress.state].filter(Boolean).join(', ')} </div>
                          <div className="text-sm text-gray-700 mt-2">📞 {selectedAddress.phone}</div>
                        </div>
                      </div>
                      <div>
                        <button onClick={() => { setAddress(selectedAddress); setShowAddressModal(true) }} className="text-sm text-blue-600">EDIT</button>
                      </div>
                    </div>
                  </label>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="bg-gray-100 rounded-2xl p-6 shadow border border-gray-200 sticky top-6 fade-in">
              <h2 className="text-2xl font-bold mb-4">Your Order</h2>
              <div className="space-y-3 mb-4 max-h-52 overflow-auto">
                {items.map(i => (
                  <div key={`${i.id}-${i.selectedSize}-${i.selectedColor}`} className="flex items-center gap-3">
                    <img src={i.image} alt={i.name} className="w-14 h-14 object-cover rounded-md" />
                    <div className="flex-1">
                      <div className="font-medium">{i.name}</div>
                      <div className="text-sm text-gray-600">Qty: {i.quantity}</div>
                    </div>
                    <div className="font-semibold">₹{(i.price * i.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{cartTotals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span>₹{cartTotals.deliveryFee}</span>
                </div>
                <hr />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{cartTotals.total.toFixed(2)}</span>
                </div>
              </div>

              <style>{`.fade-in{animation:fadeIn 360ms ease-out;}@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>

              {/* Combined action: Place order and open payment. Requires a valid address. */}
              {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
              <button
                disabled={!hasItems || placing || !( (selectedAddress || address)?.line1 )}
                onClick={handlePlaceOrder}
                aria-disabled={!hasItems || placing || !( (selectedAddress || address)?.line1 )}
                className={`w-full py-3 rounded-lg font-semibold shadow-md transform transition duration-200 ease-out mb-4 ${(!hasItems || placing || !( (selectedAddress || address)?.line1 )) ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-800 hover:scale-105'}`}
              >
                {placing ? 'Placing order...' : 'Place Order & Pay Now'}
              </button>
              {!hasItems && <div className="text-sm text-gray-500">Your cart is empty.</div>}
              {(hasItems && !( (selectedAddress || address)?.line1 )) && <div className="text-sm text-gray-600">Please add a delivery address to proceed.</div>}
            </div>
          </div>
        </div>
      </div>
      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-40" onClick={() => setShowAddressModal(false)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add / Edit Address</h3>
              <button className="text-gray-500" onClick={() => setShowAddressModal(false)}>✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input value={address.name} onChange={e => setAddress(prev => ({ ...prev, name: e.target.value }))} placeholder="Full name" className="w-full px-3 py-2 border rounded-lg" />
              <input value={address.phone} onChange={e => setAddress(prev => ({ ...prev, phone: e.target.value }))} placeholder="Phone number" className="w-full px-3 py-2 border rounded-lg" />
              <input value={address.line1} onChange={e => setAddress(prev => ({ ...prev, line1: e.target.value }))} placeholder="Address line 1" className="col-span-1 md:col-span-2 w-full px-3 py-2 border rounded-lg" />
              <input value={address.line2} onChange={e => setAddress(prev => ({ ...prev, line2: e.target.value }))} placeholder="Address line 2 (optional)" className="col-span-1 md:col-span-2 w-full px-3 py-2 border rounded-lg" />
              <input value={address.city} onChange={e => setAddress(prev => ({ ...prev, city: e.target.value }))} placeholder="City" className="w-full px-3 py-2 border rounded-lg" />
              <input value={address.state} onChange={e => setAddress(prev => ({ ...prev, state: e.target.value }))} placeholder="State" className="w-full px-3 py-2 border rounded-lg" />
              <input value={address.zip} onChange={e => setAddress(prev => ({ ...prev, zip: e.target.value }))} placeholder="ZIP" className="w-full px-3 py-2 border rounded-lg" />
            </div>

            {error && <div className="mt-3 text-sm text-red-600">{error}</div>}

            <div className="mt-4 flex items-center gap-3 justify-end">
              <button className="px-4 py-2 border rounded-lg" onClick={() => setShowAddressModal(false)}>Cancel</button>
              <button className="px-4 py-2 bg-black text-white rounded-lg" onClick={handleSaveAddress}>{saving ? 'Saving...' : 'Save Address'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
