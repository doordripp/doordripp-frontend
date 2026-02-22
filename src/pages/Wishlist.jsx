import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, ArrowRight } from 'lucide-react'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import { ProductCard } from '../features/catalog'

export default function Wishlist() {
  const { items, removeFromWishlist, totalItems } = useWishlist()
  const { addToCart } = useCart()
  const [selectedItems, setSelectedItems] = useState({})
  const [sortNewest, setSortNewest] = useState(true)

  const handleRemoveFromWishlist = (productId) => {
    removeFromWishlist(productId)
  }

  const handleAddToCart = (product) => {
    // Add to cart with default selections (can be improved later)
    addToCart(product, {
      size: product.selectedSize || 'M',
      color: product.selectedColor || product.colors?.[0] || 'black',
      quantity: 1
    })
  }

  const handleSelectItem = (productId) => {
    setSelectedItems(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }))
  }

  const selectedCount = Object.values(selectedItems).filter(Boolean).length
  const selectedProducts = items.filter(item => {
    const pid = item._id || item.id || item.productId
    return selectedItems[pid]
  })

  const handleAddSelectedToCart = () => {
    selectedProducts.forEach(product => {
      handleAddToCart(product)
    })
    setSelectedItems({})
  }

  const handleRemoveSelected = () => {
    const toRemove = Object.keys(selectedItems).filter(k => selectedItems[k])
    toRemove.forEach(id => removeFromWishlist(id))
    setSelectedItems({})
  }

  if (totalItems === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4">
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm text-gray-500">
              <li><Link to="/" className="hover:text-gray-700">Home</Link></li>
              <li className="before:content-['>'] before:mx-2">My Wishlist</li>
            </ol>
          </nav>

          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
            <div className="mx-auto w-24 h-24 mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Heart size={48} className="text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6">Add items to your wishlist to save them for later</p>
            <Link to="/products" className="inline-block px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
              Continue Shopping
            </Link>
          </div>
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
            <li className="before:content-['>'] before:mx-2">My Wishlist</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Wishlist</h1>
          <div className="flex items-center justify-between gap-4">
            <p className="text-gray-600">{totalItems} item{totalItems !== 1 ? 's' : ''} saved</p>
            <div className="flex items-center gap-3">
              <button onClick={() => setSortNewest(s => !s)} className="text-sm text-gray-600 underline">{sortNewest ? 'Newest first' : 'Oldest first'}</button>
              <div className="text-sm text-gray-600">{selectedCount} selected</div>
              <button onClick={handleAddSelectedToCart} disabled={selectedCount===0} className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded">Add selected</button>
              <button onClick={handleRemoveSelected} disabled={selectedCount===0} className="text-sm bg-red-50 text-red-600 px-3 py-1 rounded">Remove selected</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Header with Select All */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedCount === items.length && items.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        const newSelected = {}
                        items.forEach(item => {
                          const pid = item._id || item.id || item.productId
                          newSelected[pid] = true
                        })
                        setSelectedItems(newSelected)
                      } else {
                        setSelectedItems({})
                      }
                    }}
                    className="w-5 h-5 rounded border-gray-300"
                  />
                  <span className="text-sm font-medium">
                    {selectedCount > 0 ? `${selectedCount} selected` : 'Select All'}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedItems({})}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Deselect All
                </button>
              </div>

              {/* Wishlist Items */}
              <div className="divide-y divide-gray-200">
                {(sortNewest ? items : items.slice().reverse()).map((product) => {
                  const pid = product._id || product.id || product.productId
                  return (
                  <div key={pid} className="p-4 hover:bg-gray-50 transition">
                    <div className="flex gap-4 items-center">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedItems[pid] || false}
                        onChange={() => handleSelectItem(pid)}
                        className="w-5 h-5 rounded border-gray-300 mt-1"
                      />

                      {/* Product Image */}
                      <Link to={`/product/${pid}`} className="flex-shrink-0">
                        <img src={product.image} alt={product.name} className="w-24 h-24 object-cover rounded-lg" />
                      </Link>

                      {/* Product Details */}
                      <div className="flex-1">
                        <Link to={`/product/${pid}`} className="block mb-1">
                          <h3 className="font-semibold text-gray-900 hover:text-blue-600">
                            {product.name}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-lg font-bold text-gray-900">
                            ₹{typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
                          </span>
                          {product.originalPrice && (
                            <>
                              <span className="text-sm line-through text-gray-500">
                                ₹{product.originalPrice?.toFixed(2)}
                              </span>
                              {product.discount && (
                                <span className="text-sm font-semibold text-green-600">
                                  {product.discount}% Off
                                </span>
                              )}
                            </>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                          >
                            <ShoppingCart size={16} />
                            Add to Cart
                          </button>
                          <button
                            onClick={() => handleRemoveFromWishlist(pid)}
                            className="flex items-center gap-2 px-3 py-1 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                          >
                            <Heart size={16} fill="currentColor" />
                            Remove
                          </button>
                        </div>
                      </div>

                      {/* Status Indicator */}
                      {product.stock <= 0 && (
                        <div className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded h-fit">
                          Out of Stock
                        </div>
                      )}
                    </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-6">
              <h3 className="font-semibold mb-4">Summary</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Items</span>
                  <span className="font-medium">{totalItems}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Selected</span>
                  <span className="font-medium">{selectedCount}</span>
                </div>
              </div>

              <button
                disabled={selectedCount === 0}
                onClick={handleAddSelectedToCart}
                className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
              >
                <ShoppingCart size={18} />
                Add to Cart
              </button>

              <Link
                to="/products"
                className="mt-3 flex items-center justify-center gap-2 w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
              >
                Continue Shopping
                <ArrowRight size={16} />
              </Link>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-600 mb-3">💡 Tip: Select items to add multiple products to cart at once</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
