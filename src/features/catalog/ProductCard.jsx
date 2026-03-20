import { useState } from 'react'
import { ShoppingCart, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import { optimizeImage } from '../../config/imagekit'
import { TrialButton } from '../trial/TrialButton'


const formatProductTitle = (title = '') => {
  return title
    .replace(
      /\b(for men|for women|stylish|latest|new|winter|summer|standard length|fashion|trendy|best|jackets?|shirts?|t-shirts?|hoodies?|sweatshirts?)\b/gi,
      ''
    )
    .replace(/\s+/g, ' ')
    .trim()
}


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

  const id             = product.id || product._id || product.slug
  const name           = product.name
  const images         = product.images?.length ? product.images : [product.image || '/images/placeholder.png']
  const image          = images[0]
  const secondImage    = images[1] || image
  const price          = product.price || 0
  const originalPrice  = product.originalPrice
  const discount       = product.discount
  const subcategory    = product.subcategory
  const stock          = product.stock ?? 1
  const isOutOfStock   = stock === 0
  const hasDiscount    = originalPrice && discount
  const productLink    = `/product/${id}`

  return (
    <div className={`group w-full h-full ${className}`}>
      {/* CARD — sharp edges */}
      <div
        className="bg-white border border-gray-100 hover:border-gray-300 hover:shadow-2xl transition-all duration-400 flex flex-col h-full overflow-hidden"
        style={{ borderRadius: 0 }}
      >
        {/* IMAGE */}
        <div
          className="relative h-[300px] w-full bg-neutral-50 overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Link to={productLink} className="block h-full w-full">
            {/* Primary image */}
            <img
              src={optimizeImage(image, { width: 800, height: 800 })}
              alt={name}
              style={{ maxWidth: 'none' }}
              className={`absolute inset-0 h-full w-full object-cover transition-all duration-600 ease-out ${
                isHovered && images.length > 1
                  ? 'opacity-0 scale-105'
                  : 'opacity-100 scale-100 group-hover:scale-[1.04]'
              }`}
            />

            {/* Secondary image on hover */}
            {images.length > 1 && (
              <img
                src={optimizeImage(secondImage, { width: 800, height: 800 })}
                alt={name}
                style={{ maxWidth: 'none' }}
                className={`absolute inset-0 h-full w-full object-cover transition-all duration-600 ease-out ${
                  isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                }`}
              />
            )}

            {/* Dark overlay on hover */}
            <div
              className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-400 pointer-events-none"
              style={{ zIndex: 5 }}
            />
          </Link>

          {/* DISCOUNT BADGE — sharp rectangle */}
          {hasDiscount && showDiscount && (
            <span
              className="absolute left-0 top-4 bg-rose-600 text-white px-2.5 py-1 text-[11px] font-black tracking-widest uppercase z-10"
              style={{ borderRadius: 0 }}
            >
              -{discount}%
            </span>
          )}

          {/* WISHLIST — sharp square */}
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              isInWishlist(id) ? removeFromWishlist(id) : addToWishlist({ ...product, id })
            }}
            className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center bg-white border border-gray-200 hover:border-black hover:bg-black hover:text-white transition-all duration-200 z-10"
            style={{ borderRadius: 0 }}
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                isInWishlist(id) ? 'text-rose-600 fill-rose-600' : ''
              }`}
            />
          </button>
        </div>

        {/* INFO */}
        <div className="flex flex-col flex-1 p-4 gap-2">

          {/* PRICE */}
          <div className="flex items-center gap-2.5">
            <span className="text-lg font-black text-black tracking-tight">₹{price}</span>
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through font-medium">₹{originalPrice}</span>
            )}
          </div>

          {/* TITLE */}
          <h3
            title={name}
            className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2 min-h-[40px]"
          >
            {formatProductTitle(name)}
          </h3>

          {/* SUBCATEGORY */}
          {subcategory && (
            <span className="text-[10px] uppercase tracking-[0.15em] text-gray-400 font-medium">{subcategory}</span>
          )}

          {/* CTA */}
          {showAddToCart && (
            <div className="mt-auto space-y-2">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  if (!isOutOfStock) {
                    addToCart(product, { size: 'M', color: 'default', quantity: 1 })
                  }
                }}
                disabled={isOutOfStock}
                className={`w-full flex items-center justify-center gap-2 py-2.5 border-2 text-xs font-black uppercase tracking-wider transition-all duration-250 ${
                  isOutOfStock
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-white border-black text-black hover:bg-black hover:text-white'
                }`}
                style={{ borderRadius: 0 }}
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                {isOutOfStock ? 'OUT OF STOCK' : 'ADD TO CART'}
              </button>
              <TrialButton product={product} className="w-full" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
