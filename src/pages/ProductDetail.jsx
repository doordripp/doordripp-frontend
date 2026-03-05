import { useState, useEffect, useLayoutEffect } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import {
  Star,
  Plus,
  Minus,
  ShoppingCart,
  Check,
  Heart
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
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [isAddedToCart, setIsAddedToCart] = useState(false)
  const [descExpanded, setDescExpanded] = useState(false)
  const [specsExpanded, setSpecsExpanded] = useState(false)
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
          keyFeatures: Array.isArray(p.keyFeatures) ? p.keyFeatures : [],
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

            {/* FULL PRODUCT TITLE + WISHLIST */}
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-3xl font-bold text-gray-900 leading-snug flex-1">
                {formatTitleFull(product.name)}
              </h1>
              <button
                type="button"
                onClick={() => {
                  const productId = product.id || product._id
                  if (isInWishlist(productId)) {
                    removeFromWishlist(productId)
                  } else {
                    addToWishlist({ ...product, image: product.images[0] })
                  }
                }}
                className="flex-shrink-0 p-3 rounded-full border-2 border-gray-200 hover:border-red-500 hover:bg-red-50 transition-all duration-200 group"
                title={isInWishlist(product.id || product._id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <Heart
                  size={24}
                  className={`transition-all duration-200 ${
                    isInWishlist(product.id || product._id)
                      ? 'fill-red-500 text-red-500'
                      : 'text-gray-600 group-hover:text-red-500'
                  }`}
                />
              </button>
            </div>

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

        {/* ================= KEY FEATURES ================= */}
        {product.keyFeatures && product.keyFeatures.length > 0 && (
          <div className="mt-16 pt-10 border-t border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Key Features</h2>
            <ul className="space-y-2 pl-1">
              {product.keyFeatures.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-800 flex-shrink-0"></span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ================= SPECIFICATIONS & DESCRIPTION ================= */}
        <div className="mt-16 pt-10 border-t border-gray-100">
          <div className="max-w-3xl">
            {/* Tabs */}
            <div className="flex gap-1 mb-8 bg-gray-100 rounded-full p-1 w-fit">
              <button
                onClick={() => setActiveTab('specifications')}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold tracking-wide transition-all duration-300 ${
                  activeTab === 'specifications'
                    ? 'bg-black text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Specifications
              </button>
              <button
                onClick={() => setActiveTab('description')}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold tracking-wide transition-all duration-300 ${
                  activeTab === 'description'
                    ? 'bg-black text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Description
              </button>
            </div>

            {/* Specifications Tab */}
            {activeTab === 'specifications' && (
              <div>
                {product.details && Object.keys(product.details).length > 0 ? (
                  (() => {
                    const entries = Object.entries(product.details).filter(
                      ([, value]) => value && !(Array.isArray(value) && value.length === 0)
                    );
                    const visibleEntries = specsExpanded ? entries : entries.slice(0, 6);
                    const hasMore = entries.length > 6;
                    return (
                      <>
                        <div className="relative">
                          <div className="flex flex-wrap gap-3">
                            {visibleEntries.map(([key, value], idx) => (
                              <div
                                key={idx}
                                className="bg-gray-50 hover:bg-gray-100 rounded-2xl px-5 py-3.5 transition-colors duration-200 border border-gray-100"
                              >
                                <span className="text-[11px] uppercase tracking-[0.12em] text-gray-400 block mb-0.5">{key}</span>
                                <span className="text-[14px] text-gray-900 font-semibold block">{Array.isArray(value) ? value.join(', ') : value}</span>
                              </div>
                            ))}
                          </div>
                          {!specsExpanded && hasMore && (
                            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none rounded-b-2xl" />
                          )}
                        </div>
                        {hasMore && (
                          <button
                            onClick={() => setSpecsExpanded(!specsExpanded)}
                            className="mt-5 mx-auto flex items-center gap-2 px-5 py-2 rounded-full border border-gray-900 text-gray-900 text-xs font-bold uppercase tracking-wider hover:bg-gray-900 hover:text-white transition-all duration-300"
                          >
                            {specsExpanded ? 'Show Less' : 'View All'}
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-300 ${specsExpanded ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"/></svg>
                          </button>
                        )}
                      </>
                    );
                  })()
                ) : (
                  <p className="text-gray-400 text-sm italic">No specifications available for this product.</p>
                )}
              </div>
            )}

            {/* Description Tab */}
            {activeTab === 'description' && (
              <div>
                {product.description ? (
                  <>
                    <div className="relative">
                      <div
                        className={`text-gray-600 text-[15px] leading-[1.9] whitespace-pre-line transition-all duration-300 ${
                          !descExpanded ? 'line-clamp-6' : ''
                        }`}
                      >
                        {product.description}
                      </div>
                      {!descExpanded && product.description.split('\n').length > 4 && (
                        <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                      )}
                    </div>
                    {product.description.split('\n').length > 4 && (
                      <button
                        onClick={() => setDescExpanded(!descExpanded)}
                        className="mt-3 text-sm font-semibold text-black hover:text-gray-600 transition-colors flex items-center gap-1.5 group"
                      >
                        {descExpanded ? (
                          <><span>Show Less</span><span className="transition-transform group-hover:-translate-y-0.5">&uarr;</span></>
                        ) : (
                          <><span>Read More</span><span className="transition-transform group-hover:translate-y-0.5">&darr;</span></>
                        )}
                      </button>
                    )}
                  </>
                ) : (
                  <p className="text-gray-400 text-sm italic">No description available for this product.</p>
                )}
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
