import { useState } from 'react'
import { Star, StarHalf, ShoppingCart, Check, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'

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
  showAddToCart = true
}) {
  const id = product.id || product._id || product.slug
  const name = product.name
  const image = product.image || (product.images && product.images[0]) || '/images/placeholder.png'
  const price = product.price || 0
  const originalPrice = product.originalPrice
  const discount = product.discount
  const rating = product.rating || { rating: 0, reviews: 0 }
  const subcategory = product.subcategory
  const colors = product.colors || product.availableColors || []

  const hasDiscount = originalPrice && discount
  
  if (viewMode === 'list') {
    return (
      <div className="group">
        <div className="flex bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow relative">
          <Link to={`/product/${id}`} className="flex flex-1">
            <div className="w-32 h-32 flex-shrink-0 mr-6">
              <img 
                src={image} 
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
    <div className={`group cursor-pointer transition-all duration-300 hover:scale-[1.02] ${className}`}>
      {/* Product Image */}
      <div className="relative overflow-hidden rounded-3xl bg-gray-100">
        <Link to={`/product/${id}`}>
          <img
            src={image}
            alt={name}
            className="h-[298px] w-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        </Link>
        
        {/* Discount Badge */}
        {hasDiscount && showDiscount && (
          <div className="absolute right-3 top-3 rounded-full bg-red-500 px-3 py-1 text-xs font-medium text-white">
            -{discount}%
          </div>
        )}

        {/* Add to Cart Button - Overlay */}
        {showAddToCart && (
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <AddToCartButton 
              product={product} 
              variant="icon"
            />
          </div>
        )}
      </div>

      {/* Product Info */}
      <Link to={`/product/${id}`}>
        <div className="mt-4 space-y-2">
          {/* Product Name */}
          <h3 className="text-lg font-bold text-black line-clamp-2 group-hover:text-gray-700 transition-colors">
            {name}
          </h3>

          {/* Star Rating */}
          <StarRating 
            rating={rating.rating} 
            reviews={rating.reviews}
            className="text-sm"
          />

          {/* Pricing */}
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-black">
              ${price}
            </span>
            
            {hasDiscount && (
              <>
                <span className="text-xl font-bold text-gray-400 line-through">
                  ${originalPrice}
                </span>
                <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-600">
                  -{discount}%
                </span>
              </>
            )}
          </div>
          
          {/* Available Colors */}
          {colors && colors.length > 0 && (
            <div className="flex items-center space-x-2 mt-3">
              <span className="text-xs text-gray-600">Available colors:</span>
              <div className="flex space-x-1">
                {colors.slice(0, 3).map((color, index) => (
                  <div
                    key={index}
                    className="w-3 h-3 rounded-full border border-gray-300"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
                {colors.length > 3 && (
                  <span className="text-xs text-gray-400">+{colors.length - 3}</span>
                )}
              </div>
            </div>
          )}

          {/* Add to Cart Button - Mobile/Always visible option */}
          {showAddToCart && (
            <div className="pt-2 sm:hidden">
              <AddToCartButton 
                product={product} 
                variant="default" 
                className="w-full text-sm py-2"
              />
            </div>
          )}
        </div>
      </Link>
    </div>
  )
}