import { useState } from 'react'
import { ShoppingCart, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import { optimizeImage } from '../../config/imagekit'


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

  const id = product.id || product._id || product.slug
  const name = product.name
  const images = product.images?.length
    ? product.images
    : [product.image || '/images/placeholder.png']

  const image = images[0]
  const secondImage = images[1] || image

  const price = product.price || 0
  const originalPrice = product.originalPrice
  const discount = product.discount
  const subcategory = product.subcategory
  const stock = product.stock ?? 1
  const isOutOfStock = stock === 0
  const hasDiscount = originalPrice && discount

  return (
    <div
      className={`group w-full h-full ${className}`}
    >
      {/* CARD */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm hover:shadow-lg transition flex flex-col h-full overflow-hidden">

        {/* IMAGE (FIXED HEIGHT) */}
        <div
          className="relative h-[300px] w-full bg-gray-100 overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Link to={`/product/${id}`} className="block h-full w-full">
            <img
              src={optimizeImage(image, { width: 800, height: 800 })}
              alt={name}
              className={`absolute inset-0 h-full w-full object-cover transition-all duration-500 ${
                isHovered && images.length > 1
                  ? 'opacity-0 scale-105'
                  : 'opacity-100 scale-100'
              }`}
            />

            {images.length > 1 && (
              <img
                src={optimizeImage(secondImage, { width: 800, height: 800 })}
                alt={name}
                className={`absolute inset-0 h-full w-full object-cover transition-all duration-500 ${
                  isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
              />
            )}
          </Link>

          {/* DISCOUNT */}
          {hasDiscount && showDiscount && (
            <span className="absolute left-3 top-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow">
              -{discount}%
            </span>
          )}

          {/* WISHLIST */}
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              isInWishlist(id)
                ? removeFromWishlist(id)
                : addToWishlist({ ...product, id })
            }}
            className="absolute top-3 right-3 bg-white rounded-full w-9 h-9 flex items-center justify-center shadow"
          >
            <Heart
              className={`h-5 w-5 ${
                isInWishlist(id)
                  ? 'text-red-500 fill-red-500'
                  : 'text-gray-600'
              }`}
            />
          </button>
        </div>

        {/* INFO (FLEX COLUMN) */}
        <div className="flex flex-col flex-1 p-4 gap-2">

          {/* PRICE */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-black">₹{price}</span>
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through">
                ₹{originalPrice}
              </span>
            )}
          </div>

          {/* TITLE (LOCK HEIGHT) */}
          <h3 
             title={name}
          className="text-sm font-semibold text-gray-800 leading-tight line-clamp-2 min-h-[40px]"
            >
            {formatProductTitle(name)}

          </h3>

          {/* SUBCATEGORY */}
          {subcategory && (
            <span className="text-[11px] uppercase text-gray-500">
              {subcategory}
            </span>
          )}

          {/* CTA PUSHED TO BOTTOM */}
          {showAddToCart && (
            <div className="mt-auto">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  if (!isOutOfStock) {
                    addToCart(product, {
                      size: 'M',
                      color: 'default',
                      quantity: 1,
                    })
                  }
                }}
                disabled={isOutOfStock}
                className={`w-full flex items-center justify-center gap-2 py-2 border rounded-lg text-xs font-semibold transition ${
                  isOutOfStock
                    ? 'bg-gray-200 text-gray-500 border-gray-300'
                    : 'bg-white border-black hover:bg-black hover:text-white'
                }`}
              >
                <ShoppingCart className="h-4 w-4" />
                {isOutOfStock ? 'OUT OF STOCK' : 'ADD TO CART'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
