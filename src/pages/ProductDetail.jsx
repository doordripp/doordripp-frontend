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
  const [quantity, setQuantity] = useState(1)
  const [isAddedToCart, setIsAddedToCart] = useState(false)
  const [descExpanded, setDescExpanded] = useState(false)
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
  

  /* FORCE SCROLL TOP */
  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

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
          rating: p.rating || { rating: 0 },
          category: p.category,
          subcategory: p.subcategory,
          description: p.description
        })
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

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* ================= BREADCRUMB ================= */}
        <Breadcrumb items={buildProductBreadcrumb({ product })} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* ================= IMAGES ================= */}
          <div>
            <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden">
              <img
                src={optimizeImage(images[selectedImage], { width: 800 })}
                className="w-full h-full object-cover"
                alt={product.name}
              />
            </div>

            <div className="grid grid-cols-4 gap-4 mt-4">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 ${
                    selectedImage === i ? 'border-black' : 'border-transparent'
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
          <div className="space-y-6">

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
                className="text-sm text-blue-600 mt-2"
                onClick={() => setDescExpanded(!descExpanded)}
              >
                {descExpanded ? 'See less' : 'See more'}
              </button>
            </div>

            {/* ADD TO CART */}
            <button
              onClick={() => {
                addToCart(product, { quantity })
                setIsAddedToCart(true)
                setTimeout(() => setIsAddedToCart(false), 1500)
              }}
              className="w-full bg-black text-white py-4 rounded-full font-semibold flex items-center justify-center gap-2"
            >
              {isAddedToCart ? <Check /> : <ShoppingCart />}
              {isAddedToCart ? 'Added to Cart' : 'Add to Cart'}
            </button>
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
