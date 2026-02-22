import { Fragment, useState } from 'react'
import { X, Minus, Plus, ShoppingBag, ArrowRight, Tag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'

export default function CartDrawer() {
  const {
    items,
    cartTotals,
    isDrawerOpen,
    toggleDrawer,
    updateQuantity,
    removeFromCart,
    promoCode,
    applyPromoCode,
    removePromoCode,
    isTrialCheckout,
    trialFee
  } = useCart()

  const [promoInput, setPromoInput] = useState('')
  const [promoMessage, setPromoMessage] = useState('')

  const handlePromoSubmit = (e) => {
    e.preventDefault()
    if (!promoInput.trim()) return
    
    const result = applyPromoCode(promoInput.trim())
    if (result.success) {
      setPromoMessage(`${result.discount}% discount applied!`)
      setPromoInput('')
    } else {
      setPromoMessage(result.error)
    }
    
    setTimeout(() => setPromoMessage(''), 3000)
  }

  const handleRemovePromo = () => {
    removePromoCode()
    setPromoMessage('Promo code removed')
    setTimeout(() => setPromoMessage(''), 2000)
  }

  if (!isDrawerOpen) return null

  return (
    <Fragment>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
        onClick={() => toggleDrawer(false)}
      />

      {/* Cart Drawer */}
      <div 
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-6 w-6 text-gray-700" />
              <h2 className="text-xl font-bold text-gray-900">
                Shopping Cart
                {cartTotals.totalItems > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({cartTotals.totalItems} {cartTotals.totalItems === 1 ? 'item' : 'items'})
                  </span>
                )}
              </h2>
            </div>
            <button
              onClick={() => toggleDrawer(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Cart Content */}
          {items.length === 0 ? (
            /* Empty Cart */
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-500 mb-6">Add some items to get started!</p>
                <button
                  onClick={() => toggleDrawer(false)}
                  className="bg-black text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors duration-200"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : (
            <Fragment>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={`${item.id}-${item.selectedSize}-${item.selectedColor}`}
                      className="group flex gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                    >
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg bg-white"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 text-sm leading-snug mb-1 truncate">
                          {item.name}
                        </h3>
                        
                        <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                          <span>Size: {item.selectedSize}</span>
                          <span>•</span>
                          <span>Color: {item.selectedColor}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          {/* Price */}
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">₹{item.price}</span>
                            {item.originalPrice && (
                              <span className="text-xs text-gray-500 line-through">
                                ₹{item.originalPrice}
                              </span>
                            )}
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(
                                item.id, 
                                item.selectedSize, 
                                item.selectedColor, 
                                item.quantity - 1
                              )}
                              className="p-1 hover:bg-gray-200 rounded-md transition-colors"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="text-sm font-medium min-w-[1.5rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(
                                item.id, 
                                item.selectedSize, 
                                item.selectedColor, 
                                item.quantity + 1
                              )}
                              className="p-1 hover:bg-gray-200 rounded-md transition-colors"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors duration-200 opacity-0 group-hover:opacity-100"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer with Promo and Checkout */}
              <div className="border-t border-gray-200 p-6 space-y-4 bg-white">
                {/* Promo Code Section */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Promo Code</span>
                  </div>
                  
                  {promoCode ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <span className="text-green-700 font-medium text-sm">{promoCode}</span>
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
                        placeholder="Enter code"
                        className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
                      >
                        Apply
                      </button>
                    </form>
                  )}
                  
                  {promoMessage && (
                    <p className={`mt-2 text-xs ${promoMessage.includes('applied') || promoMessage.includes('removed') ? 'text-green-600' : 'text-red-600'}`}>
                      {promoMessage}
                    </p>
                  )}
                </div>

                {/* Order Summary */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{cartTotals.subtotal.toFixed(2)}</span>
                  </div>
                  
                  {cartTotals.discountAmount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Discount</span>
                      <span>-₹{cartTotals.discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  {isTrialCheckout && trialFee > 0 && (
                    <div className="flex items-center justify-between text-gray-600">
                      <div className="flex flex-col">
                        <span className="text-sm">Trial Service Fee</span>
                        <span className="text-[10px] text-gray-400">Covers 3 items delivery & return</span>
                      </div>
                      <span className="font-medium text-black">₹{trialFee.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery</span>
                    <span className="font-medium">₹{cartTotals.deliveryFee}</span>
                  </div>
                  
                  <hr className="border-gray-200" />
                  
                  <div className="flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span>₹{cartTotals.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Link
                    to="/cart"
                    onClick={() => toggleDrawer(false)}
                    className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    View Cart
                  </Link>
                    <Link
                      to="/checkout"
                      onClick={() => toggleDrawer(false)}
                      className="w-full inline-flex bg-black text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-800 transition-colors duration-200 items-center justify-center gap-2 group"
                    >
                      Checkout
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </Link>
                </div>
              </div>
            </Fragment>
          )}
        </div>
      </div>
    </Fragment>
  )
}