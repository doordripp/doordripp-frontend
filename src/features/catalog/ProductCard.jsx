import { useState } from 'react'
import { Star, StarHalf, ShoppingCart, Check, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { optimizeImage } from '../../config/imagekit'

// Star Rating Component
function StarRating({ rating, reviews, showReviews = true, className = '' }) {
  const renderStars = () => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)
    }
    
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="h-4 w-4 fill-yellow-400 text-yellow-400" />)
    }
    
    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />)
    }
    
    return stars
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center">
        {renderStars()}
      </div>
      {showReviews && (
        <span className="text-sm text-gray-500">
          {rating}/5 ({reviews})
        </span>
      )}
    </div>
  )
}

// Add to Cart Button Component
function AddToCartButton({ product, className = '', variant = 'default', size = 'M', color = 'default' }) {
  const { addToCart, isInCart, getCartItemQuantity } = useCart()
  const [isAdding, setIsAdding] = useState(false)
  const [justAdded, setJustAdded] = useState(false)

  const inCart = isInCart(product.id, size, color)
  const quantity = getCartItemQuantity(product.id, size, color)

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isAdding || justAdded) return
    
    setIsAdding(true)
    
    // Add to cart
    addToCart(product, { size, color, quantity: 1 })
    
    // Show adding animation
    setTimeout(() => {
      setIsAdding(false)
      setJustAdded(true)
      
      // Reset after showing success
      setTimeout(() => {
        setJustAdded(false)
      }, 1500)
    }, 500)
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handleAddToCart}
        disabled={isAdding}
        className={`group relative p-3 bg-white hover:bg-black text-gray-700 hover:text-white border-2 border-gray-200 hover:border-black rounded-full transition-all duration-300 transform hover:scale-110 ${className}`}
        aria-label="Add to cart"
      >
        {isAdding ? (
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-current"></div>
        ) : justAdded ? (
          <Check className="h-5 w-5 text-green-500" />
        ) : (
          <ShoppingCart className="h-5 w-5" />
        )}
        
        {inCart && quantity > 0 && (
          <span className="absolute -top-2 -right-2 bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
            {quantity}
          </span>
        )}
      </button>
    )
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={isAdding || justAdded}
      className={`flex items-center justify-center gap-2 px-6 py-3 bg-black hover:bg-gray-800 text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
    >
      {isAdding ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          <span>Adding...</span>
        </>
      ) : justAdded ? (
        <>
          <Check className="h-4 w-4 text-green-400" />
          <span>Added!</span>
        </>
      ) : (
        <>
          <ShoppingCart className="h-4 w-4" />
          <span>{inCart ? `Add More` : 'Add to Cart'}</span>
        </>
      )}
    </button>
  )
}

// Product Card Component
export default function ProductCard({ 
  product, 
  className = '',
  showDiscount = true,
  onClick,
  viewMode = 'grid',
  showAddToCart = true,
  // When provided, this index will be forwarded to the product detail page
  initialImageIndex = 0,
}) {
  const { addToCart } = useCart()
  const [isHovered, setIsHovered] = useState(false)
  const id = product.id || product._id || product.slug
  const name = product.name
  const images = product.images || [product.image] || ['/images/placeholder.png']
  const image = images[0]
  const secondImage = images.length > 1 ? images[1] : image
  const price = product.price || 0
  const originalPrice = product.originalPrice
  const discount = product.discount
  const rating = product.rating || { rating: 0, reviews: 0 }
  const subcategory = product.subcategory
  const colors = product.colors || product.availableColors || []
  const stock = product.stock || 0
  const isOutOfStock = stock === 0

  const hasDiscount = originalPrice && discount
  
  if (viewMode === 'list') {
    return (
      <div className="group">
        <div className="flex bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow relative">
          <Link to={`/product/${id}`} state={{ imageIndex: initialImageIndex }} className="flex flex-1" onClick={scrollToTop}>
            <div className="w-32 h-32 flex-shrink-0 mr-6">
              <img 
                src={optimizeImage(image, { width: 150, height: 150, quality: 85 })} 
                alt={name}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-black mb-2">
                    {name}
                  </h3>
                  {subcategory && <p className="text-sm text-gray-600 mb-3">{subcategory}</p>}
                  
                  <StarRating 
                    rating={rating.rating} 
                    reviews={rating.reviews}
                    className="text-sm mb-3"
                  />
                  
                  {colors && colors.length > 0 && (
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-sm text-gray-600">Colors:</span>
                      <div className="flex space-x-1">
                        {colors.slice(0, 4).map((color, index) => (
                          <div
                            key={index}
                            className="w-4 h-4 rounded-full border border-gray-300"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                        {colors.length > 4 && (
                          <span className="text-xs text-gray-500">+{colors.length - 4}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-xl font-bold">${price}</span>
                    {hasDiscount && (
                      <>
                        <span className="text-lg text-gray-500 line-through">${originalPrice}</span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          -{discount}%
                        </span>
                      </>
                    )}
                  </div>
                  
                  {showAddToCart && (
                    <AddToCartButton 
                      product={product} 
                      variant="default" 
                      className="w-full text-sm py-2"
                    />
                  )}
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={`group cursor-pointer transition-all duration-500 hover:-translate-y-2 ${className}`} style={{ minHeight: 420, minWidth: 260, maxWidth: 320, width: '100%' }}>
      {/* Product Card - Image Container with Info Box Below */}
      <div className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-200 hover:border-gray-300 flex flex-col h-full">
        {/* Image Container */}
        <div 
          className="relative bg-gray-100 overflow-hidden aspect-[4/5] w-full min-h-[260px] max-h-[320px] flex-shrink-0"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Link to={`/product/${id}`} state={{ imageIndex: 0 }} onClick={scrollToTop} className="block h-full w-full">
            {/* First Image */}
            <img
              src={optimizeImage(image, { width: 400, height: 500, quality: 85 })}
              alt={name}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
                isOutOfStock ? 'opacity-60 grayscale' : ''
              } ${isHovered && images.length > 1 ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}
              loading="lazy"
              style={{ minHeight: 260, maxHeight: 320 }}
            />
            {/* Second Image - Shows on Hover */}
            {images.length > 1 && (
              <img
                src={optimizeImage(secondImage, { width: 400, height: 500, quality: 85 })}
                alt={`${name} - view 2`}
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
                  isOutOfStock ? 'opacity-60 grayscale' : ''
                } ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                loading="lazy"
                style={{ minHeight: 260, maxHeight: 320 }}
              />
            )}
          </Link>
          {/* Out of Stock Badge */}
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 z-30">
              <div className="bg-white px-6 py-3 rounded-xl shadow-2xl transform rotate-[-15deg]">
                <span className="text-red-600 font-bold text-lg">OUT OF STOCK</span>
              </div>
            </div>
          )}
          {/* Discount Badge */}
          {hasDiscount && showDiscount && !isOutOfStock && (
            <div className="absolute left-3 top-3 rounded-xl bg-gradient-to-br from-red-500 via-red-600 to-red-700 px-3 py-1.5 text-xs font-bold text-white shadow-2xl backdrop-blur-sm transform hover:scale-105 transition-transform duration-300 z-20">
              -{discount}%
            </div>
          )}
          {/* Three Dots Menu */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-500 z-20">
            <div className="w-9 h-9 bg-white backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl hover:bg-gray-50 transition-colors duration-300">
              <div className="flex flex-col gap-0.5">
                <div className="w-1 h-1 bg-gray-800 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-800 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-800 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
        {/* Product Info Box - Clean Separation */}
        <div className="p-2.5 bg-white border-t-2 border-gray-100 flex-1 flex flex-col justify-between">
          <Link to={`/product/${id}`} state={{ imageIndex: 0 }} onClick={scrollToTop}>
            {/* Price - Bold and Clear */}
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-lg font-black tracking-tight text-gray-900">
                ₹{price.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-xs font-semibold text-gray-400 line-through">
                  ₹{originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            {/* Product Name - Clean Typography */}
            <h3 className="text-xs font-semibold text-gray-800 line-clamp-2 leading-relaxed mb-1 tracking-wide">
              {name}
            </h3>
            {/* Subcategory - Subtle Badge */}
            {subcategory && (
              <div className="inline-block mb-1.5">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider px-2 py-0.5 bg-gray-100 rounded-md">
                  {subcategory}
                </span>
              </div>
            )}
          </Link>
          {/* Add to Cart Button - Full Width */}
          {showAddToCart && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!isOutOfStock) {
                  addToCart(product, { size: 'M', color: 'default', quantity: 1 });
                }
              }}
              disabled={isOutOfStock}
              className={`w-full flex items-center justify-center gap-2 py-2 mt-2 font-semibold text-xs border-2 rounded-lg transition-all duration-300 ${
                isOutOfStock
                  ? 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed'
                  : 'bg-white hover:bg-black text-black hover:text-white border-black transform hover:scale-105'
              }`}
            >
              <ShoppingCart className="h-4 w-4" />
              <span>{isOutOfStock ? 'OUT OF STOCK' : 'ADD TO CART'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ULTRA-AGGRESSIVE FORCED scroll-to-top: GUARANTEES page starts at absolute top
function scrollToTop(e) {
  try {
    if (e) e.stopPropagation()
    
    const forceScrollTop = () => {
      // All scroll methods - FORCE to 0,0
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      window.scrollTo(0, 0)
      window.scroll(0, 0)
      
      // Direct manipulation
      document.documentElement.scrollTop = 0
      document.documentElement.scrollLeft = 0
      document.body.scrollTop = 0
      document.body.scrollLeft = 0
      
      // Disable smooth scroll
      document.documentElement.style.scrollBehavior = 'auto'
      
      // Force on root
      const root = document.getElementById('root')
      if (root) root.scrollTop = 0
    }
    
    // Execute 10 times immediately
    for (let i = 0; i < 10; i++) {
      forceScrollTop()
    }

    // Multiple requestAnimationFrame passes
    requestAnimationFrame(forceScrollTop)
    requestAnimationFrame(() => requestAnimationFrame(forceScrollTop))
    
    // Aggressive timing
    setTimeout(forceScrollTop, 1)
    setTimeout(forceScrollTop, 5)
    setTimeout(forceScrollTop, 10)
    setTimeout(forceScrollTop, 20)
    setTimeout(forceScrollTop, 50)
    setTimeout(forceScrollTop, 100)
  } catch (err) {
    // Fallback - still force scroll
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }
}