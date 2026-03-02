import { useState, useEffect, useLayoutEffect } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import {
  Star,
  Plus,
  Minus,
  ShoppingCart,
  Check
} from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { ProductCard } from '../features/catalog'
import { Reviews } from '../components/reviews'
import StarRating from '../components/ui/StarRating'
import api from '../services/api'
import { optimizeImage } from '../config/imagekit'
import Breadcrumb, { buildProductBreadcrumb } from '../components/ui/Breadcrumb'
import { useAuth } from '../context/AuthContext'
import { TrialButton } from '../features/trial/TrialButton'
import ImageZoom from '../components/ui/ImageZoom'


/* ============================
   UTILITY FUNCTIONS
   ============================ */

// Safe JSON parser
const tryParseJSON = (jsonString) => {
  if (!jsonString) return {}
  if (typeof jsonString === 'object') return jsonString
  try {
    return JSON.parse(jsonString)
  } catch {
    return {}
  }
}

/* ============================
   TITLE FORMATTERS (UI ONLY)
   ============================ */

// FULL title (SEO safe)
const formatTitleFull = (title = '') => {
  return title.split('||')[0].trim()
}

// Breadcrumb title (ONLY 3 words)
const formatTitleForBreadcrumb = (title = '') => {
  return title
    .split('||')[0]
    .split(' ')
    .slice(0, 3)
    .join(' ')
}

export default function ProductDetail() {
  const { id } = useParams()
  const { addToCart } = useCart()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [isAddedToCart, setIsAddedToCart] = useState(false)
  const [descExpanded, setDescExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState('specifications')
  const [recommendedProducts, setRecommendedProducts] = useState([])
  
  // Handle review submission to refresh product rating
  const handleReviewSubmitted = async (review) => {
    try {
      // Refresh product data to get updated rating
      const res = await api.get(`/products/${id}`)
      const p = res.data
      
      setProduct(prev => ({
        ...prev,
        rating: p.rating || { rating: 0, reviews: 0 }
      }))
    } catch (error) {
      console.error('Error refreshing product data:', error)
    }
  }

  /* FETCH PRODUCT */
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      try {
        const res = await api.get(`/products/${id}`)
        const p = res.data

        setProduct({
          id: p._id || p.id,
          name: p.name,
          images: p.images?.length ? p.images : [p.image],
          price: p.price,
          originalPrice: p.originalPrice,
          stock: p.stock,
          rating: p.rating || { rating: 0 },
          category: p.category,
          subcategory: p.subcategory,
          description: p.description,
          details: typeof p.details === 'string' ? tryParseJSON(p.details) : p.details,
          sizes: p.sizes || [],
          colors: p.colors || []
        })

        if (p.sizes?.length) setSelectedSize(p.sizes[0])
        else setSelectedSize('M')

        if (p.colors?.length) setSelectedColor(p.colors[0])
        else setSelectedColor('')

      } catch (err) {
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  /* RECOMMENDED PRODUCTS */
  useEffect(() => {
    if (!product?.category) return
    api
      .get('/products', { params: { category: product.category, limit: 8 } })
      .then(res => {
        const list = res.data?.data || res.data || []
        setRecommendedProducts(
          list.filter(p => (p._id || p.id) !== product.id)
        )
      })
  }, [product])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>
  }

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center">Product not found</div>
  }

  const images = product.images
  const isOutOfStock = (product.stock ?? 0) <= 0

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* ================= BREADCRUMB ================= */}
        <Breadcrumb items={buildProductBreadcrumb({ product })} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* ================= IMAGES ================= */}
          <div className="space-y-4">
            <ImageZoom
              key={selectedImage}
              src={optimizeImage(images[selectedImage], { width: 800 })}
              alt={product.name}
            />

            <div className="grid grid-cols-4 gap-4">
              {images.map((img, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                    selectedImage === i 
                      ? 'border-black scale-95 shadow-lg' 
                      : 'border-transparent hover:border-gray-300 hover:scale-105 bg-gray-50'
                  }`}
                >
                  <img
                    src={optimizeImage(img, { width: 200 })}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                </button>
              ))}
            </div>
          </div>

          {/* ================= INFO ================= */}
          <div className="space-y-6 flex flex-col">

            {/* FULL PRODUCT TITLE */}
            <h1 className="text-3xl font-bold text-gray-900 leading-snug">
              {formatTitleFull(product.name)}
            </h1>

            {/* RATING */}
            <div className="flex items-center gap-3">
              <StarRating rating={product.rating?.rating || 0} size={20} />
              <span className="text-lg font-medium">
                {product.rating?.rating || 0}/5
              </span>
              {product.rating?.reviews > 0 && (
                <>
                  <span className="text-gray-400">•</span>
                  <a 
                    href="#reviews" 
                    className="text-blue-600 hover:underline"
                    onClick={(e) => {
                      e.preventDefault()
                      document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' })
                    }}
                  >
                    {product.rating.reviews} {product.rating.reviews === 1 ? 'review' : 'reviews'}
                  </a>
                </>
              )}
            </div>

            {/* PRICE */}
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold">₹{product.price}</span>
              {product.originalPrice && (
                <span className="line-through text-gray-400">
                  ₹{product.originalPrice}
                </span>
              )}
            </div>

            {/* DESCRIPTION */}
            <div>
              <p
                className="text-gray-600"
                style={
                  descExpanded
                    ? {}
                    : {
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }
                }
              >
                {product.description}
              </p>
              <button
                type="button"
                className="text-sm text-blue-600 mt-2"
                onClick={() => setDescExpanded(!descExpanded)}
              >
                {descExpanded ? 'See less' : 'See more'}
              </button>
            </div>

            {/* COLOR & SIZE SELECTORS */}
            <div className="space-y-6 py-4 border-y border-gray-100">
              {/* SIZE SELECTOR */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold uppercase tracking-wider text-gray-900">
                      Size
                    </span>
                    <span className="text-sm text-gray-500 font-medium">Selected: {selectedSize}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        type="button"
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[50px] h-[50px] flex items-center justify-center rounded-lg border-2 text-sm font-bold transition-all duration-200 ${
                          selectedSize === size
                            ? 'border-black bg-black text-white shadow-sm'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600 bg-white'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* COLOR SELECTOR */}
              {product.colors && product.colors.length > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold uppercase tracking-wider text-gray-900">
                      Color
                    </span>
                    <span className="text-sm text-gray-500 font-medium">Selected: {selectedColor}</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((color) => (
                      <button
                        type="button"
                        key={color.name || color}
                        onClick={() => setSelectedColor(color.name || color)}
                        className={`w-12 h-12 rounded-full border-3 transition-all duration-200 flex items-center justify-center ${
                          (selectedColor === (color.name || color))
                            ? 'border-black scale-110 shadow-md'
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                        style={{ 
                          backgroundColor: color.hex || '#ccc',
                          borderColor: (selectedColor === (color.name || color)) ? '#000' : '#ddd'
                        }}
                        title={color.name || color}
                      >
                        {(selectedColor === (color.name || color)) && (
                          <div className="w-3 h-3 bg-white rounded-full"></div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* QUANTITY */}
              <div className="space-y-3">
                <span className="text-sm font-bold uppercase tracking-wider text-gray-900">
                  Quantity
                </span>
                <div className="flex items-center w-32 border-2 border-gray-200 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="flex-1 py-2 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-10 text-center font-bold">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="flex-1 py-2 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* ADD TO CART & TRIAL BUTTON */}
            <div className="space-y-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  if (isOutOfStock) return
                  addToCart({ ...product, image: product.images[0] }, { 
                    quantity, 
                    size: selectedSize, 
                    color: selectedColor || 'Default' 
                  })
                  setIsAddedToCart(true)
                  setTimeout(() => setIsAddedToCart(false), 1500)
                }}
                disabled={isOutOfStock}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                  isOutOfStock
                    ? 'bg-gray-200 text-gray-500'
                    : 'bg-black text-white hover:bg-gray-900'
                }`}
              >
                {isAddedToCart && !isOutOfStock ? <Check className="animate-in zoom-in duration-300" /> : <ShoppingCart />}
                {isOutOfStock ? 'Out of Stock' : isAddedToCart ? 'Added to Cart' : `Add to Cart • ₹${product.price * quantity}`}
              </button>
              <TrialButton 
                product={product}
                className="w-full py-4 text-base"
              />
            </div>
          </div>
        </div>

        {/* ================= RECOMMENDED PRODUCTS ================= */}
        {recommendedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">
              You Might Also Like
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {recommendedProducts.slice(0, 4).map(p => (
                <ProductCard key={p._id || p.id} product={p} />
              ))}
            </div>
          </div>
        )}

        {/* ================= SPECIFICATIONS & DESCRIPTION ================= */}
        <div className="mt-16 pt-10 border-t border-gray-200">
          <div className="max-w-2xl">
            {/* Tabs */}
            <div className="flex gap-8 border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab('specifications')}
                className={`pb-4 font-bold uppercase text-sm tracking-wide transition-colors ${
                  activeTab === 'specifications'
                    ? 'text-gray-900 border-b-2 border-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Specification
              </button>
              <button
                onClick={() => setActiveTab('description')}
                className={`pb-4 font-bold uppercase text-sm tracking-wide transition-colors ${
                  activeTab === 'description'
                    ? 'text-gray-900 border-b-2 border-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Description
              </button>
            </div>

            {/* Specifications Tab */}
            {activeTab === 'specifications' && (
              <div className="space-y-4">
                {product.details ? (
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="grid grid-cols-3 gap-4">
                      {Object.entries(product.details).map(([key, value], idx) => (
                        <div key={idx} className="space-y-2">
                          <p className="text-xs uppercase text-gray-600 font-medium tracking-wide">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </p>
                          <p className="text-sm text-gray-900 font-medium">
                            {Array.isArray(value) ? value.join(', ') : value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No specifications available for this product.</p>
                )}
              </div>
            )}

            {/* Description Tab */}
            {activeTab === 'description' && (
              <div className="space-y-4">
                <div className="text-gray-700 text-sm leading-relaxed">
                  {product.description || 'No description available for this product.'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================= REVIEWS SECTION (Bottom) ================= */}
        <div id="reviews" className="mt-20 pt-10 border-t border-gray-200">
          <Reviews 
            productId={product.id} 
            onReviewSubmitted={handleReviewSubmitted}
          />
        </div>
      </div>
    </div>
  )
}
