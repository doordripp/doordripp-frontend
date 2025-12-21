import { useState, useEffect } from 'react'
import { ShoppingCart, Minus, Plus, X, ArrowRight, Tag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import ProductCard from '../features/catalog/ProductCard'
import api from '../services/api'

export default function Cart() {
  const { 
    items, 
    cartTotals, 
    updateQuantity, 
    removeFromCart, 
    promoCode,
    applyPromoCode,
    removePromoCode 
  } = useCart()
  
  const [promoInput, setPromoInput] = useState('')
  const [promoMessage, setPromoMessage] = useState('')
  const [recommendedProducts, setRecommendedProducts] = useState([])
  const [debugInfo, setDebugInfo] = useState(null)

  // Fetch recommended products based on categories/subcategories in cart
  useEffect(() => {
    const fetchRecommended = async () => {
      if (!items || items.length === 0) return

      // Tally categories and subcategories to pick the most relevant
      const catCounts = {}
      const subCounts = {}
      items.forEach(it => {
        if (it.category) catCounts[it.category] = (catCounts[it.category] || 0) + 1
        if (it.subcategory) subCounts[it.subcategory] = (subCounts[it.subcategory] || 0) + 1
      })

      let topCategory = Object.keys(catCounts).sort((a,b) => (catCounts[b]||0) - (catCounts[a]||0))[0]
      let topSubcategory = Object.keys(subCounts).sort((a,b) => (subCounts[b]||0) - (subCounts[a]||0))[0]

      // If no category/subcategory present on cart items, try fetching product details
      if (!topCategory && !topSubcategory) {
        try {
          const ids = [...new Set(items.map(it => String(it.id || it._id || it.productId)))].slice(0, 3)
          const detailPromises = ids.map(pid => api.get(`/products/${pid}`).then(r => r.data).catch(() => null))
          const details = await Promise.all(detailPromises)
          details.forEach(p => {
            if (!p) return
            const cat = p.category || p.categoryName || p.type
            const sub = p.subcategory || p.subCategory || p.subcategoryName
            if (cat) catCounts[cat] = (catCounts[cat] || 0) + 1
            if (sub) subCounts[sub] = (subCounts[sub] || 0) + 1
          })

          topCategory = Object.keys(catCounts).sort((a,b) => (catCounts[b]||0) - (catCounts[a]||0))[0]
          topSubcategory = Object.keys(subCounts).sort((a,b) => (subCounts[b]||0) - (subCounts[a]||0))[0]
        } catch (err) {
          console.error('Failed to fetch product details for cart items:', err)
          setDebugInfo(prev => ({ ...prev, error: String(err) }))
        }
      }

      if (!topCategory && !topSubcategory) {
        setDebugInfo({ topCategory: null, topSubcategory: null, reason: 'no category found' })
        return
      }

      try {
        const params = { limit: 12 }
        if (topCategory) params.category = topCategory
        if (topSubcategory) params.subcategory = topSubcategory

        const response = await api.get('/products', { params })
        let products = []
        if (Array.isArray(response.data)) products = response.data
        else if (Array.isArray(response.data.data)) products = response.data.data
        else if (Array.isArray(response.data.products)) products = response.data.products
        else products = []

        // Remove products already in cart
        const cartIds = new Set(items.map(it => String(it.id || it._id || it.productId)))
        const candidates = products
          .map(p => ({ ...p, id: p._id || p.id }))
          .filter(p => !cartIds.has(String(p.id)))

        setRecommendedProducts(candidates.slice(0, 6))
        setDebugInfo({ topCategory, topSubcategory, fetched: candidates.length, sampleIds: candidates.slice(0,6).map(p => p._id || p.id) })
      } catch (err) {
        console.error('Failed to fetch recommended products for cart:', err)
        setDebugInfo({ error: String(err) })
      }
    }

    fetchRecommended()
  }, [items])

  const handlePromoSubmit = (e) => {
    e.preventDefault()
    if (!promoInput.trim()) return
    
    const result = applyPromoCode(promoInput.trim())
    if (result.success) {
      setPromoMessage(`Promo code applied! ${result.discount}% discount`)
      setPromoInput('')
    } else {
      setPromoMessage(result.error)
    }
    
    // Clear message after 3 seconds
    setTimeout(() => setPromoMessage(''), 3000)
  }

  const handleRemovePromo = () => {
    removePromoCode()
    setPromoMessage('Promo code removed')
    setTimeout(() => setPromoMessage(''), 2000)
  }

  // Empty cart state
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm text-gray-500">
              <li><Link to="/" className="hover:text-gray-700">Home</Link></li>
              <li className="before:content-['>'] before:mx-2">Cart</li>
            </ol>
          </nav>

          <section className="w-full py-16">
            <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-6 px-6 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-gray-200 bg-white">
                <ShoppingCart className="h-8 w-8 text-gray-400" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Your cart is empty</h1>
              <p className="text-lg text-gray-600 max-w-md">
                Looks like you haven't added anything to your cart yet. 
                Start shopping and discover our amazing products!
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-full bg-black px-8 py-4 text-sm font-medium text-white hover:bg-gray-800 transition-colors duration-200"
              >
                Continue shopping
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            
            {/* Recommendations based on cart */}
            {recommendedProducts.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">You might also like</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 items-stretch auto-rows-[520px]">
                  {recommendedProducts.map((p) => (
                    <div key={p.id} className="col-span-1 h-full">
                      <ProductCard product={p} showAddToCart={true} className="h-full" initialImageIndex={0} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li><Link to="/" className="hover:text-gray-700">Home</Link></li>
            <li className="before:content-['>'] before:mx-2">Cart</li>
          </ol>
        </nav>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Your cart</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {items.map((item) => (
                <div
                  key={`${item.id}-${item.selectedSize}-${item.selectedColor}`}
                  className="group relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
                >
                  {/* Remove button */}
                  <button
                    onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)}
                    className="absolute top-4 right-4 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors duration-200"
                    aria-label="Remove item"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <div className="flex gap-6">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-xl bg-gray-100"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <div className="pr-8">
                        <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-black transition-colors">
                          {item.name}
                        </h3>
                        
                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                          <div className="flex items-center gap-4">
                            <span>
                              <strong>Size:</strong> {item.selectedSize}
                            </span>
                            <span>
                              <strong>Color:</strong> {item.selectedColor}
                            </span>
                          </div>
                        </div>

                        {/* Price and Quantity */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl font-bold text-gray-900">
                              ₹{item.price}
                            </span>
                            {item.originalPrice && (
                              <span className="text-lg text-gray-500 line-through">
                                ₹{item.originalPrice}
                              </span>
                            )}
                            {item.discount && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                -{item.discount}%
                              </span>
                            )}
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3">
                            <div className="flex items-center border border-gray-200 rounded-full">
                              <button
                                onClick={() => updateQuantity(
                                  item.id, 
                                  item.selectedSize, 
                                  item.selectedColor, 
                                  item.quantity - 1
                                )}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="px-4 py-2 font-medium min-w-[3rem] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(
                                  item.id, 
                                  item.selectedSize, 
                                  item.selectedColor, 
                                  item.quantity + 1
                                )}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              {/* Summary Details */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-lg">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">₹{cartTotals.subtotal.toFixed(2)}</span>
                </div>
                
                {promoCode && cartTotals.discountAmount > 0 && (
                  <div className="flex justify-between text-lg text-red-600">
                    <span>Discount ({promoCode})</span>
                    <span>-₹{cartTotals.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-lg">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-semibold">₹{cartTotals.deliveryFee}</span>
                </div>
                
                <hr className="border-gray-200" />
                
                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span>₹{cartTotals.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Promo Code Section */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Promo Code</span>
                </div>
                
                {promoCode ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-green-700 font-medium">{promoCode}</span>
                    <button
                      onClick={handleRemovePromo}
                      className="text-green-600 hover:text-green-800 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handlePromoSubmit} className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      placeholder="Add promo code"
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                    >
                      Apply
                    </button>
                  </form>
                )}
                
                {promoMessage && (
                  <p className={`mt-2 text-sm ${promoMessage.includes('applied') || promoMessage.includes('removed') ? 'text-green-600' : 'text-red-600'}`}>
                    {promoMessage}
                  </p>
                )}
              </div>

              {/* Checkout Button */}
              <Link to="/checkout" className="w-full inline-flex bg-black text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-gray-800 transition-colors duration-200 items-center justify-center gap-2 group">
                Go to Checkout
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}