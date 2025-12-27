import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { apiPost, apiPut } from '../services/apiClient'
import { loadGoogleMaps } from '../utils/googleMapsLoader'
import AddressSelector from '../components/AddressSelector'
import addressIllustration from '../assets/map.png'

export default function Checkout() {
  const { items, cartTotals, clearCart } = useCart()
  const { user, fetchMe } = useAuth()
  const navigate = useNavigate()

  // Map-selected address (mandatory)
  const [mapSelectedAddress, setMapSelectedAddress] = useState(null)
  // Pre-saved addresses list
  const [savedAddresses, setSavedAddresses] = useState([])
  // Currently selected address for order (map or saved)
  const [selectedAddress, setSelectedAddress] = useState(null)
  
  const [showMapSelector, setShowMapSelector] = useState(false)
  const [mapsReady, setMapsReady] = useState(false)
  const [mapsError, setMapsError] = useState('')
  const [mapsLoading, setMapsLoading] = useState(false)
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState('')

  const hasItems = items && items.length > 0

  // Load pre-saved addresses from backend
  useEffect(() => {
    const loadSavedAddresses = async () => {
      if (!user?._id) return
      try {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'
        const response = await fetch(`${API_BASE}/addresses`, { credentials: 'include' })
        if (response.ok) {
          const data = await response.json()
          setSavedAddresses(data.addresses || [])
        }
      } catch (e) {
        console.error('Error loading saved addresses:', e)
      }
    }
    loadSavedAddresses()
  }, [user?._id])

  // Lazy-load Google Maps when the map selector is opened
  useEffect(() => {
    if (!showMapSelector) return
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      setMapsError('Google Maps API key is missing.')
      return
    }
    setMapsLoading(true)
    loadGoogleMaps(apiKey)
      .then(() => {
        setMapsReady(true)
        setMapsError('')
      })
      .catch((err) => setMapsError(err?.message || 'Failed to load map'))
      .finally(() => setMapsLoading(false))
  }, [showMapSelector])

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
      location: mapAddress.location,
      isMapSelected: true
    }
    setMapSelectedAddress(mapped)
    setSelectedAddress(mapped) // Use map selection as default
    setShowMapSelector(false)
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
        shippingAddress: {
          street: selectedAddress.line1,
          city: selectedAddress.city,
          state: selectedAddress.state,
          zip: selectedAddress.zip,
          country: 'India'
        }
      }
      
      console.log('Placing order with data:', orderData)
      
      const response = await apiPost('/orders', orderData)
      console.log('Order response:', response)
      
      if (response && response.orderId) {
        clearCart()
        navigate(`/orders/${response.orderId}`)
      } else {
        setError(response?.error || response?.message || 'Failed to place order')
      }
    } catch (e) {
      console.error('Order error:', e)
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
              <h2 className="text-xl font-semibold mb-6">Select Delivery Address</h2>

              {/* Show map selector if not yet selected */}
              {!mapSelectedAddress ? (
                <div>
                  {showMapSelector && (
                    <div className="border rounded-xl overflow-hidden shadow-sm mb-4">
                      {mapsError && (
                        <div className="p-4 text-sm text-red-700 bg-red-50 border-b border-red-100">
                          {mapsError}
                        </div>
                      )}
                      {mapsLoading && !mapsError && (
                        <div className="p-6 text-center text-gray-600">Loading map...</div>
                      )}
                      {mapsReady && !mapsLoading && !mapsError && (
                        <AddressSelector
                          onAddressSelect={handleMapAddressSelect}
                          onClose={() => setShowMapSelector(false)}
                        />
                      )}
                    </div>
                  )}
                  <div className="p-8 text-center border rounded-xl bg-yellow-50 shadow-sm border-yellow-200">
                    <h3 className="text-lg font-semibold text-yellow-800 mb-2">📍 Delivery Address Required</h3>
                    <p className="text-sm text-yellow-700 mb-4">Please select your delivery location on the map to proceed with your order.</p>
                    <button 
                      onClick={() => setShowMapSelector(true)} 
                      className="px-6 py-2 rounded-lg bg-yellow-600 text-white font-semibold hover:bg-yellow-700"
                    >
                      Select on Map
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Show selected map address */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">📍 Selected Delivery Address</h3>
                    <label className="block bg-green-50 border border-green-200 rounded-xl p-4 shadow-sm cursor-pointer hover:bg-green-100 transition">
                      <div className="flex items-start gap-3">
                        <input 
                          type="radio" 
                          name="addressChoice" 
                          value="map" 
                          checked={selectedAddress?.isMapSelected === true} 
                          onChange={() => setSelectedAddress(mapSelectedAddress)} 
                          className="mt-1 accent-green-600 w-4 h-4" 
                        />
                        <div>
                          <div className="font-semibold text-green-900">Map Selected Address</div>
                          <div className="text-sm text-gray-700">{[mapSelectedAddress.line1, mapSelectedAddress.line2, mapSelectedAddress.city, mapSelectedAddress.state].filter(Boolean).join(', ')} </div>
                          <div className="text-sm text-gray-700 mt-1">📞 {mapSelectedAddress.phone}</div>
                        </div>
                      </div>
                    </label>
                    <button 
                      onClick={() => setShowMapSelector(true)} 
                      className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Change Address on Map
                    </button>
                  </div>

                  {/* Show saved addresses as alternatives */}
                  {savedAddresses.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Or Use Saved Address</h3>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {savedAddresses.map((addr) => (
                          <label key={addr._id} className="block bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm cursor-pointer hover:bg-gray-100 transition">
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
                                  isMapSelected: false 
                                })} 
                                className="mt-1 accent-blue-600 w-4 h-4" 
                              />
                              <div>
                                <div className="inline-flex items-center gap-2 mb-1">
                                  <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-md">{addr.label}</span>
                                  {addr.isDefault && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">Default</span>}
                                </div>
                                <div className="text-sm text-gray-700">{[addr.addressLine1, addr.addressLine2, addr.city, addr.state].filter(Boolean).join(', ')} </div>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-gray-100 rounded-2xl p-6 shadow border border-gray-200 sticky top-6">
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
              
              <div className="border-t border-gray-300 pt-4 space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{cartTotals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>₹{cartTotals.deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{cartTotals.total.toFixed(2)}</span>
                </div>
              </div>

              {error && (
                <div className="p-3 mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                  {error}
                </div>
              )}

              <button 
                onClick={handlePlaceOrder}
                disabled={!selectedAddress || !hasItems || placing}
                className="w-full py-3 rounded-lg bg-red-500 text-white font-bold hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {placing ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
