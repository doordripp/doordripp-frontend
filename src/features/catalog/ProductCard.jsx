import { useState } from 'react'
import { ShoppingCart, Check, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import { optimizeImage } from '../../config/imagekit'

export default function ProductCard({
  product,
  className = '',
  showDiscount = true,
  initialImageIndex = 0,
  showAddToCart = true,
}) {
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const [isHovered, setIsHovered] = useState(false)

  const id = product.id || product._id || product.slug
  const name = product.name
  const images = product.images || [product.image] || ['/images/placeholder.png']
  const image = images[0]
  const secondImage = images.length > 1 ? images[1] : image
  const price = product.price || 0
  const originalPrice = product.originalPrice
  const discount = product.discount
  const subcategory = product.subcategory
  const stock = product.stock || 0
  const isOutOfStock = stock === 0
  const hasDiscount = originalPrice && discount

  return (
    <div
      className={`group cursor-pointer transition-all duration-300 hover:-translate-y-1 w-full ${className}`}
    >
      <div className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all border border-gray-200 overflow-hidden flex flex-col h-auto">

        {/* IMAGE */}
        <div
          className="relative bg-gray-100 overflow-hidden w-full aspect-[3/4]"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Link to={`/product/${id}`} className="block h-full w-full">
            <img
              src={optimizeImage(image, { width: 800, height: 800 })}
              alt={name}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
                isHovered && images.length > 1 ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
              }`}
            />

            {images.length > 1 && (
              <img
                src={optimizeImage(secondImage, { width: 800, height: 800 })}
                alt={name}
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
                  isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
              />
            )}
          </Link>

          {/* DISCOUNT */}
          {hasDiscount && showDiscount && (
            <div className="absolute left-3 top-3 bg-red-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-xl">
              -{discount}%
            </div>
          )}

          {/* WISHLIST */}
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (isInWishlist(id)) removeFromWishlist(id)
              else addToWishlist({ ...product, id })
            }}
            className="absolute top-3 right-3 bg-white rounded-full w-9 h-9 flex items-center justify-center shadow-xl"
          >
            <Heart
              className={`h-5 w-5 ${
                isInWishlist(id) ? 'text-red-500 fill-red-500' : 'text-gray-600'
              }`}
            />
          </button>
        </div>

        {/* INFO SECTION */}
        <div className="p-3 border-t border-gray-100 flex flex-col gap-2 h-auto">

          <Link to={`/product/${id}`}>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold">₹{price}</span>

              {hasDiscount && (
                <span className="text-xs text-gray-400 line-through">
                  ₹{originalPrice}
                </span>
              )}
            </div>

            <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-tight">
              {name}
            </h3>

            {subcategory && (
              <span className="inline-block mt-1 text-[11px] px-2 py-0.5 bg-gray-100 rounded-md uppercase text-gray-600">
                {subcategory}
              </span>
            )}
          </Link>

          {showAddToCart && (
            <button
              onClick={(e) => {
                e.preventDefault()
                if (!isOutOfStock) {
                  addToCart(product, { size: 'M', color: 'default', quantity: 1 })
                }
              }}
              disabled={isOutOfStock}
              className={`mt-2 w-full flex items-center justify-center gap-2 py-2 border rounded-lg text-xs font-semibold ${
                isOutOfStock
                  ? 'bg-gray-200 text-gray-500 border-gray-300'
                  : 'bg-white border-black hover:bg-black hover:text-white'
              }`}
            >
              <ShoppingCart className="h-4 w-4" />
              {isOutOfStock ? 'OUT OF STOCK' : 'ADD TO CART'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
