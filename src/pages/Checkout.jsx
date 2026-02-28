import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useTrial } from '../context/TrialContext'
import { apiGet, apiPost, apiPut, apiDelete } from '../services/apiClient'
import AddressSelector from '../components/AddressSelector'
import addressIllustration from '../assets/map.png'
import { Trash2, Edit } from 'lucide-react'
import { toast } from 'react-hot-toast'

const DELIVERY_OPTIONS = [
  { id: 'priority', label: 'Priority Delivery', sublabel: 'Fastest', eta: '25 minutes', charge: 120, badge: '🔥' },
  { id: 'standard', label: 'Standard Delivery', sublabel: 'Best Value', eta: '35 minutes', charge: 100, badge: '⭐' },
  { id: 'regular', label: 'Regular Delivery', sublabel: 'Economical', eta: '45 minutes', charge: 80, badge: '🚚' }
]

export default function Checkout() {
  const { 
    items, 
    cartTotals, 
    clearCart, 
    isTrialCheckout: cartIsTrial,
    trialFee: cartTrialFee,
    trialItems: cartTrialItems,
    purchasedItemId: cartPurchasedItemId
  } = useCart()
  const { user, fetchMe } = useAuth()
  const { clearTrial } = useTrial()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Trial Mode State - Check location state first, then fallback to cart context
  const isTrialCheckout = location.state?.isTrialCheckout || cartIsTrial || false
  const trialItems = location.state?.trialItems || cartTrialItems || []
  const purchasedItemId = location.state?.purchasedItemId || cartPurchasedItemId || null
  const trialFee = location.state?.trialFee || cartTrialFee || 0

  // Map-selected address (mandatory)
  const [mapSelectedAddress, setMapSelectedAddress] = useState(null)
  // Pre-saved addresses list
  const [savedAddresses, setSavedAddresses] = useState([])
  // Currently selected address for order (map or saved)
  const [selectedAddress, setSelectedAddress] = useState(null)

  // Delivery Option State
  const [deliveryType, setDeliveryType] = useState(() => {
    return localStorage.getItem('doordripp_delivery_type') || 'regular'
  })
  
  const [showMapSelector, setShowMapSelector] = useState(false)
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState('')
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)

  const hasItems = items && items.length > 0

  // Persist delivery choice
  useEffect(() => {
    localStorage.setItem('doordripp_delivery_type', deliveryType)
  }, [deliveryType])

  // Get active delivery option data
  const selectedDeliveryOption = DELIVERY_OPTIONS.find(o => o.id === deliveryType) || DELIVERY_OPTIONS[2]
  
  // Recalculate Total with selected delivery fee and potential trial fee (no GST)
  const finalTotal = cartTotals.subtotal + selectedDeliveryOption.charge + trialFee

  // Load Razorpay script on mount
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => setRazorpayLoaded(true)
    script.onerror = () => {
      setRazorpayLoaded(false)
    }
    document.body.appendChild(script)
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  const loadSavedAddresses = async () => {
    if (!user?._id) return
    try {
      const data = await apiGet('/addresses')
      const addresses = data.addresses || []
      setSavedAddresses(addresses)

      // Auto-select default address if it exists and no address is selected yet
      const defaultAddr = addresses.find(a => a.isDefault) || addresses[0]
      if (defaultAddr && !selectedAddress) {
        setSelectedAddress({
          _id: defaultAddr._id,
          name: defaultAddr.label || user?.name || '',
          line1: defaultAddr.addressLine1,
          line2: defaultAddr.addressLine2,
          city: defaultAddr.city,
          state: defaultAddr.state,
          zip: defaultAddr.zip,
          phone: defaultAddr.phone || user?.phone || '',
          latitude: defaultAddr.latitude,
          longitude: defaultAddr.longitude,
          isMapSelected: false
        })
      }
    } catch (e) {
      // Silently handle address loading errors
    }
  }

  // Load pre-saved addresses from backend
  useEffect(() => {
    loadSavedAddresses()
  }, [user?._id])

  const handleDeleteAddress = async (e, addressId) => {
    e.stopPropagation()
    e.preventDefault()
    
    if (!window.confirm('Are you sure you want to delete this address?')) return
    
    try {
      await apiDelete(`/addresses/${addressId}`)
      toast.success('Address deleted')
      
      // If the deleted address was selected, clear selection
      if (selectedAddress?._id === addressId) {
        setSelectedAddress(null)
      }
      
      // Reload addresses
      await loadSavedAddresses()
    } catch (err) {
      console.error('Error deleting address:', err)
      const msg = err?.message || err?.error || 'Failed to delete address'
      toast.error(typeof msg === 'string' ? msg : 'Failed to delete address')
    }
  }

  const handleEditAddress = (e, addr) => {
    e.stopPropagation()
    e.preventDefault()
    setEditingAddress(addr)
    setShowMapSelector(true)
  }

  const handleMapAddressSelect = (mapAddress) => {
    if (!mapAddress) return
    const mapped = {
      name: user?.name || '',
      line1: mapAddress.line1 || mapAddress.formattedAddress || '',
      line2: mapAddress.line2 || '',
      city: mapAddress.city || '',
      state: mapAddress.state || '',
      zip: mapAddress.zip || '',
      phone: user?.phone || '',
      latitude: mapAddress.location?.lat || mapAddress.latitude,
      longitude: mapAddress.location?.lng || mapAddress.longitude,
      isMapSelected: true
    }
    setMapSelectedAddress(mapped)
    setSelectedAddress(mapped)
    setShowMapSelector(false)
    setEditingAddress(null)
    loadSavedAddresses() // Refresh list since it might have been saved
  }

  const handlePlaceOrder = async () => {
    setError('')
    if (!selectedAddress) {
      setError('Please select a delivery address')
      return
    }
    
    if (!hasItems) {
      setError('No items in cart')
      return
    }
    
    try {
      setPlacing(true)
      
      // Validate all items have required fields
      const validItems = items.every(i => i.name && i.quantity > 0 && i.price >= 0)
      if (!validItems) {
        setError('Some items have invalid data')
        return
      }
      
      const orderData = {
        items: items.map(i => ({
          product: i.id,  // Product ID required by backend
          quantity: i.quantity,
          selectedSize: i.selectedSize,
          selectedColor: i.selectedColor
        })),
        deliveryType, // Added delivery type
        trialFee,     // Added trial fee
        isTrial: isTrialCheckout,
        trialItems: trialItems.map(ti => ({
          product: ti.productId,
          name: ti.name,
          image: ti.image,
          price: ti.price
        })),
        shippingAddress: {
          name: selectedAddress.name || user?.name || '',
          phone: selectedAddress.phone || user?.phone || '',
          street: selectedAddress.line1,
          city: selectedAddress.city,
          state: selectedAddress.state,
          zip: selectedAddress.zip,
          country: 'India',
          // Include coordinates for zone matching
          latitude: selectedAddress.latitude,
          longitude: selectedAddress.longitude
        }
      }
      
      const response = await apiPost('/orders', orderData)
      
      if (response && response.order && response.razorOrder) {
        const { order, razorOrder } = response
        
        // Open Razorpay payment gateway
        if (razorOrder && window.Razorpay) {
          
          const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_key',
            order_id: razorOrder.id,
            amount: razorOrder.amount,
            currency: razorOrder.currency || 'INR',
            name: 'DOORDRIPP',
            description: `Order #${order._id}`,
            customer_notification: 1,
            prefill: {
              name: user?.name || '',
              email: user?.email || '',
              contact: user?.phone || ''
            },
            handler: async (response) => {
              console.log('✅ Payment successful:', response)
              try {
                // Verify payment on backend
                const verifyResponse = await apiPost(`/orders/${order._id}/verify-payment`, {
                  orderId: order._id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature
                })
                
                if (verifyResponse?.success || verifyResponse?.message) {
                  // Payment verified - clear cart and reset delivery
                  if (isTrialCheckout) clearTrial()
                  clearCart()
                  localStorage.removeItem('doordripp_delivery_type')
                  setDeliveryType('regular')
                  
                  navigate(`/orders/${order._id}`, { 
                    state: { 
                      order, 
                      payment: response,
                      paymentSuccess: true 
                    } 
                  })
                } else {
                  setError('Payment verification failed. Please contact support.')
                  setPlacing(false)
                }
              } catch (verifyError) {
                setError('Failed to verify payment. Please contact support.')
                setPlacing(false)
              }
            },
            modal: {
              ondismiss: () => {
                setError('Payment was cancelled. Please try again.')
                setPlacing(false)
              }
            }
          }
          
          const rzp = new window.Razorpay(options)
          rzp.open()
        } else {
          // Fallback if Razorpay not loaded - just confirm order
          clearCart()
          navigate(`/orders/${order._id}`, { state: { order, paymentSuccess: true } })
        }
      } else {
        setError(response?.error || response?.message || 'Failed to place order')
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
              <h2 className="text-xl font-semibold mb-6">Delivery Address</h2>

              <div className="space-y-6">
                {/* 1. Saved Addresses Section - Shown if they exist */}
                {savedAddresses.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center justify-between">
                      Your Saved Addresses
                      <span className="text-[10px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">{savedAddresses.length}/3</span>
                    </h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                      {savedAddresses.map((addr) => (
                        <label key={addr._id} className={`group block border-2 rounded-xl p-4 shadow-sm cursor-pointer transition-all ${selectedAddress?._id === addr._id ? 'border-red-500 bg-red-50' : 'border-gray-100 bg-gray-50 hover:bg-gray-100'}`}>
                          <div className="flex items-start gap-3">
                            <input 
                              type="radio" 
                              name="addressChoice" 
                              value={addr._id} 
                              checked={selectedAddress?._id === addr._id} 
                              onChange={() => setSelectedAddress({ 
                                _id: addr._id, 
                                name: addr.label, 
                                line1: addr.addressLine1, 
                                line2: addr.addressLine2, 
                                city: addr.city, 
                                state: addr.state, 
                                zip: addr.zip, 
                                phone: addr.phone || user?.phone || '',
                                latitude: addr.latitude,
                                longitude: addr.longitude,
                                isMapSelected: false 
                              })} 
                              className="mt-1 accent-red-600 w-4 h-4" 
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${selectedAddress?._id === addr._id ? 'bg-red-200 text-red-800' : 'bg-gray-200 text-gray-700'}`}>{addr.label}</span>
                                  {addr.isDefault && <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md font-bold italic">DEFAULT</span>}
                                </div>
                                
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={(e) => handleEditAddress(e, addr)}
                                    className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                                    title="Edit Address"
                                  >
                                    <Edit size={14} />
                                  </button>
                                  <button
                                    onClick={(e) => handleDeleteAddress(e, addr._id)}
                                    className="p-1.5 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                                    title="Delete Address"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                              <div className="text-sm font-medium text-gray-900">{[addr.addressLine1, addr.addressLine2].filter(Boolean).join(', ')}</div>
                              <div className="text-sm text-gray-600">{[addr.city, addr.state, addr.zip].filter(Boolean).join(', ')}</div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Map Selection Section */}
                <div className={savedAddresses.length > 0 ? "pt-6 border-t border-gray-100" : ""}>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">
                    {savedAddresses.length > 0 ? (savedAddresses.length >= 3 ? 'Only 3 Addresses Allowed' : 'Or Select New Location') : 'Select Delivery Location'}
                  </h3>

                  {mapSelectedAddress ? (
                    <div className="space-y-3">
                      <label className={`block border-2 rounded-xl p-4 shadow-sm cursor-pointer transition-all ${selectedAddress?.isMapSelected ? 'border-green-500 bg-green-50' : 'border-gray-100 bg-gray-50 hover:bg-gray-100'}`}>
                        <div className="flex items-start gap-3">
                          <input 
                            type="radio" 
                            name="addressChoice" 
                            value="map" 
                            checked={selectedAddress?.isMapSelected === true} 
                            onChange={() => setSelectedAddress({ ...mapSelectedAddress, isMapSelected: true })} 
                            className="mt-1 accent-green-600 w-4 h-4" 
                          />
                          <div>
                            <div className="font-bold text-green-800 text-xs mb-1 uppercase tracking-tight flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-green-500"></span> Current Map Selection
                            </div>
                            <div className="text-sm font-medium text-gray-900">{[mapSelectedAddress.line1, mapSelectedAddress.line2, mapSelectedAddress.city, mapSelectedAddress.state].filter(Boolean).join(', ')} </div>
                            <div className="text-xs text-gray-500 mt-1 italic">Phone: {mapSelectedAddress.phone}</div>
                          </div>
                        </div>
                      </label>
                      <button 
                        onClick={() => setShowMapSelector(true)} 
                        className="text-xs text-blue-600 hover:text-blue-800 font-bold uppercase tracking-widest flex items-center gap-1"
                      >
                         Change Map Location
                      </button>
                    </div>
                  ) : (
                    <div>
                      {showMapSelector ? (
                        <div className="border rounded-2xl overflow-hidden shadow-inner bg-gray-50 p-2">
                          <AddressSelector
                            onAddressSelect={handleMapAddressSelect}
                            onClose={() => {
                              setShowMapSelector(false)
                              setEditingAddress(null)
                            }}
                            initialLocation={editingAddress ? { lat: editingAddress.latitude, lng: editingAddress.longitude } : null}
                            addressId={editingAddress?._id}
                          />
                        </div>
                      ) : (
                        <button 
                          onClick={() => {
                            if (savedAddresses.length >= 3) {
                              toast.error('Maximum 3 addresses allowed. Please delete one to add a new one.')
                              return
                            }
                            setShowMapSelector(true)
                          }} 
                          disabled={savedAddresses.length >= 3}
                          className={`w-full py-8 border-2 border-dashed rounded-2xl font-bold flex flex-col items-center justify-center gap-3 transition-all group ${savedAddresses.length >= 3 ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed' : 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'}`}
                        >
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform ${savedAddresses.length >= 3 ? 'bg-gray-100' : 'bg-red-100 group-hover:scale-110'}`}>
                            <img src={addressIllustration} alt="Locate" className={`w-8 h-8 object-contain ${savedAddresses.length >= 3 ? 'grayscale' : ''}`} />
                          </div>
                          <span className="text-sm">
                            {savedAddresses.length >= 3 ? 'Address Limit Reached' : 'Click to Select Location on Map'}
                          </span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-gray-100 rounded-2xl p-6 shadow border border-gray-200 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Your Order</h2>
                {isTrialCheckout && (
                  <span className="px-3 py-1 bg-black text-white text-[10px] font-bold rounded-full uppercase tracking-widest">
                    Trial & Buy Mode
                  </span>
                )}
              </div>

              {/* Items List */}
              <div className="space-y-4 mb-6 max-h-[400px] overflow-auto pr-2">
                {isTrialCheckout ? (
                  // Show all items in trial, highlight the one being purchased
                  <>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Items in your Trial Room</p>
                    {trialItems.map(i => (
                      <div key={i.productId} className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${i.productId === purchasedItemId ? 'border-black bg-white shadow-sm' : 'border-dashed border-gray-300 bg-gray-50 opacity-60'}`}>
                        <img src={i.image} alt={i.name} className="w-14 h-14 object-cover rounded-lg" />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm truncate">{i.name}</div>
                          {i.productId === purchasedItemId ? (
                            <div className="text-[10px] text-green-700 font-bold uppercase tracking-tight flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                              Buying this item
                            </div>
                          ) : (
                            <div className="text-[10px] text-gray-500 font-medium italic">Sent for trial (will return)</div>
                          )}
                        </div>
                        <div className="font-bold text-sm">
                          {i.productId === purchasedItemId ? `₹${i.price.toFixed(2)}` : 'FREE'}
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  // Regular Cart view
                  items.map(i => (
                    <div key={`${i.id}-${i.selectedSize}-${i.selectedColor}`} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                      <img src={i.image} alt={i.name} className="w-14 h-14 object-cover rounded-lg" />
                      <div className="flex-1">
                        <div className="font-bold text-sm">{i.name}</div>
                        <div className="text-xs text-gray-500 font-medium">Qty: {i.quantity} | {i.selectedSize}</div>
                      </div>
                      <div className="font-bold text-sm">₹{(i.price * i.quantity).toFixed(2)}</div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="border-t border-gray-300 pt-4 space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span className="text-sm font-medium">Subtotal</span>
                  <span className="font-bold">₹{cartTotals.subtotal.toFixed(2)}</span>
                </div>
                
                {isTrialCheckout && (
                  <div className="flex justify-between text-gray-600">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Trial Service Fee</span>
                      <span className="text-[10px] text-gray-500 leading-tight">Covers delivery & returns of 3 items</span>
                    </div>
                    <span className="font-bold">₹{trialFee.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span className="text-sm font-medium">Delivery Fee ({selectedDeliveryOption.label})</span>
                  <span className="font-bold text-green-700">₹{selectedDeliveryOption.charge.toFixed(2)}</span>
                </div>

                <div className="pt-4 border-t border-gray-300 border-dashed flex justify-between items-center text-xl font-black">
                  <span>Grand Total</span>
                  <span className="text-2xl">₹{finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Delivery Option Selector */}
              <div className="pt-2">
                  <div className="space-y-2">
                    {DELIVERY_OPTIONS.map((opt) => (
                      <label 
                        key={opt.id} 
                        className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          deliveryType === opt.id 
                            ? 'border-black bg-white shadow-md scale-[1.02]' 
                            : 'border-transparent bg-gray-50 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input 
                            type="radio" 
                            name="deliveryType" 
                            value={opt.id} 
                            checked={deliveryType === opt.id}
                            onChange={() => setDeliveryType(opt.id)}
                            className="w-4 h-4 accent-black"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-gray-900">{opt.label}</span>
                              <span className="text-xs">{opt.badge}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                opt.id === 'priority' ? 'bg-orange-100 text-orange-600 animate-priority' : 
                                opt.id === 'standard' ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600'
                              }`}>
                                {opt.sublabel}
                              </span>
                              <span className="text-[10px] font-medium text-gray-500 italic">ETA: {opt.eta}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-sm font-bold text-black">₹{opt.charge}</div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dynamic ETA Info */}
              <div className="mb-4 px-3 py-2 bg-yellow-50 border border-yellow-100 rounded-lg flex items-center gap-2 text-xs text-yellow-800">
                <span className="animate-pulse">⏳</span>
                <span>Estimated arrival: <strong>{selectedDeliveryOption.eta}</strong></span>
              </div>

              {error && (
                <div className="p-3 mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                  {error}
                </div>
              )}

              <button 
                onClick={handlePlaceOrder}
                disabled={!selectedAddress || !hasItems || placing}
                className={`w-full py-4 rounded-xl font-black text-lg shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${
                  isTrialCheckout 
                    ? 'bg-black text-white hover:bg-gray-900' 
                    : 'bg-red-600 text-white hover:bg-red-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {placing ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : isTrialCheckout ? (
                  `Pay ₹${finalTotal.toFixed(2)} & Start Trial`
                ) : (
                  'Place Order'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
  )
}
