import { useState, useEffect, useRef } from 'react'
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
    removePromoCode,
  } = useCart()

  const [promoInput, setPromoInput] = useState('')
  const [promoMessage, setPromoMessage] = useState('')
  const [recommendedProducts, setRecommendedProducts] = useState([])

  const promoTimer = useRef(null)

  /* ---------------- FETCH RECOMMENDATIONS ---------------- */
  useEffect(() => {
    const fetchRecommended = async () => {
      if (!items?.length) return

      try {
        const catCount = {}
        const subCount = {}

        items.forEach((i) => {
          if (i.category) catCount[i.category] = (catCount[i.category] || 0) + 1
          if (i.subcategory)
            subCount[i.subcategory] = (subCount[i.subcategory] || 0) + 1
        })

        const topCategory = Object.keys(catCount)[0]
        const topSubcategory = Object.keys(subCount)[0]

        const res = await api.get('/products', {
          params: {
            category: topCategory,
            subcategory: topSubcategory,
            limit: 8,
          },
        })

        const products =
          res.data?.products || res.data?.data || res.data || []

        const cartIds = new Set(items.map((i) => String(i.id)))
        const filtered = products
          .map((p) => ({ ...p, id: p._id || p.id }))
          .filter((p) => !cartIds.has(String(p.id)))

        setRecommendedProducts(filtered.slice(0, 6))
      } catch (err) {
        console.error('Failed to load recommendations', err)
      }
    }

    fetchRecommended()
  }, [items])

  /* ---------------- PROMO ---------------- */
  const handlePromoSubmit = (e) => {
    e.preventDefault()
    if (!promoInput.trim()) return

    const result = applyPromoCode(promoInput.trim())
    setPromoMessage(
      result.success
        ? `Promo code applied! ${result.discount}% discount`
        : result.error
    )

    setPromoInput('')

    clearTimeout(promoTimer.current)
    promoTimer.current = setTimeout(() => setPromoMessage(''), 3000)
  }

  const handleRemovePromo = () => {
    removePromoCode()
    setPromoMessage('Promo code removed')
    clearTimeout(promoTimer.current)
    promoTimer.current = setTimeout(() => setPromoMessage(''), 2000)
  }

  /* ---------------- RELATED PRODUCT ---------------- */
  /* related-per-item suggestion removed for a cleaner, professional cart layout */

  /* ---------------- EMPTY CART ---------------- */
  if (!items.length) {
    return (
      <div className="min-h-screen bg-gray-50 py-16 text-center">
        <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
        <h2 className="mt-4 text-2xl font-bold">Your cart is empty</h2>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-black px-8 py-3 text-white"
        >
          Continue Shopping <ArrowRight />
        </Link>
      </div>
    )
  }

  /* ---------------- CART PAGE ---------------- */
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4">
        <h1 className="mb-8 text-4xl font-bold">Your Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* CART ITEMS */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => {

              return (
                <div
                  key={`${item.id}-${item.selectedSize}-${item.selectedColor}`}
                  className="relative bg-white rounded-2xl p-6 shadow-sm border"
                >
                  <button
                    onClick={() =>
                      removeFromCart(
                        item.id,
                        item.selectedSize,
                        item.selectedColor
                      )
                    }
                    className="absolute top-4 right-4 text-red-500"
                  >
                    <X />
                  </button>

                  <div className="flex gap-6">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-24 w-24 rounded-xl object-cover"
                    />

                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <p className="text-sm text-gray-500">
                        Size: {item.selectedSize} | Color:{' '}
                        {item.selectedColor}
                      </p>

                      <div className="mt-4 flex justify-between items-center">
                        <span className="text-xl font-bold">
                          ₹{item.price}
                        </span>

                        <div className="flex items-center border rounded-full">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.selectedSize,
                                item.selectedColor,
                                item.quantity - 1
                              )
                            }
                            disabled={item.quantity <= 1}
                            className="p-2"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="px-4">{item.quantity}</span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.selectedSize,
                                item.selectedColor,
                                item.quantity + 1
                              )
                            }
                            className="p-2"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>

                      {/* per-item related suggestion intentionally removed */}
                    </div>
                  </div>
                </div>
              )
            })}

            {/* RECOMMENDED GRID */}
            {recommendedProducts.length > 0 && (
              <section className="mt-8">
                <h3 className="text-2xl font-semibold mb-4">
                  Recommended for you
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {recommendedProducts.slice(0, 4).map((p) => (
                    <div key={p.id} className="h-full">
                      <ProductCard product={p} showAddToCart />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* ORDER SUMMARY */}
          <div className="bg-white rounded-2xl p-6 shadow border h-fit sticky top-6">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{cartTotals.subtotal.toFixed(2)}</span>
              </div>

              {promoCode && (
                <div className="flex justify-between text-red-600">
                  <span>Discount ({promoCode})</span>
                  <span>-₹{cartTotals.discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Delivery</span>
                <span>₹{cartTotals.deliveryFee}</span>
              </div>

              <hr />

              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{cartTotals.total.toFixed(2)}</span>
              </div>
            </div>

            {/* PROMO */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Tag size={16} />
                <span className="text-sm font-medium">Promo Code</span>
              </div>

              {promoCode ? (
                <div className="flex justify-between bg-green-50 p-3 rounded-lg">
                  <span>{promoCode}</span>
                  <button onClick={handleRemovePromo}>
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePromoSubmit} className="flex gap-2">
                  <input
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="Add promo"
                    className="flex-1 border rounded-lg px-3 py-2"
                  />
                  <button className="bg-black text-white px-4 rounded-lg">
                    Apply
                  </button>
                </form>
              )}

              {promoMessage && (
                <p className="mt-2 text-sm text-green-600">
                  {promoMessage}
                </p>
              )}
            </div>

            <Link
              to="/checkout"
              className="w-full flex justify-center items-center gap-2 bg-black text-white py-4 rounded-xl font-semibold"
            >
              Go to Checkout <ArrowRight />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
