import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Star, StarHalf, Heart, Share2, ChevronLeft, ChevronRight, Plus, Minus, ShoppingCart, Check, User } from 'lucide-react'
import { ALL_PRODUCTS } from '../constants/products'
import { useCart } from '../context/CartContext'
import { ProductCard } from '../features/catalog'

export default function ProductDetail() {
  const { id } = useParams()
  const { addToCart } = useCart()
  const [product, setProduct] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('details')
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isAddedToCart, setIsAddedToCart] = useState(false)
  const [reviews, setReviews] = useState([
    {
      id: 1,
      userName: 'Samantha D.',
      rating: 5,
      date: 'August 14, 2023',
      review: 'I absolutely love this t-shirt! The design is unique and the fabric feels so comfortable. As a fellow designer, I appreciate the attention to detail. It\'s become my favorite go-to shirt.',
      verified: true
    },
    {
      id: 2,
      userName: 'Alex M.',
      rating: 4,
      date: 'August 15, 2023',
      review: 'This t-shirt exceeded my expectations! The colors are vibrant and the print quality is top-notch. Being a UIUX designer myself, I\'m quite picky about aesthetics, and this one delivers.',
      verified: true
    },
    {
      id: 3,
      userName: 'Ethan R.',
      rating: 4,
      date: 'August 16, 2023',
      review: 'This t-shirt is a must-have for anyone who appreciates good design. The minimalistic yet stylish design caught my eye, and the fit is perfect.',
      verified: true
    },
    {
      id: 4,
      userName: 'Olivia P.',
      rating: 5,
      date: 'August 17, 2023',
      review: 'As a design enthusiast, I value simplicity and functionality. This t-shirt represents those principles perfectly and feels amazing to wear.',
      verified: true
    }
  ])
  const [showWriteReview, setShowWriteReview] = useState(false)
  const [newReview, setNewReview] = useState({
    userName: '',
    rating: 5,
    review: ''
  })
  
  // Find product by ID
  useEffect(() => {
    const foundProduct = ALL_PRODUCTS.find(p => p.id === id)
    if (foundProduct) {
      setProduct(foundProduct)
      setSelectedColor(foundProduct.colors?.[0] || '')
      setSelectedSize(foundProduct.sizes?.[0] || '')
    }
    // Scroll to top when product detail page loads
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [id])
  
  // Get recommended products (exclude current product)
  const recommendedProducts = ALL_PRODUCTS.filter(p => 
    p.id !== id && p.category === product?.category
  ).slice(0, 4)
  
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Product not found</h2>
          <Link to="/products" className="text-blue-600 hover:underline">
            Browse all products
          </Link>
        </div>
      </div>
    )
  }
  
  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`h-5 w-5 fill-yellow-400 text-yellow-400 ${
            interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''
          }`}
          onClick={() => interactive && onRatingChange && onRatingChange(i + 1)}
        />
      )
    }
    
    if (hasHalfStar && !interactive) {
      stars.push(<StarHalf key="half" className="h-5 w-5 fill-yellow-400 text-yellow-400" />)
    }
    
    const emptyStars = interactive ? 5 - fullStars : 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      const starIndex = fullStars + i + (hasHalfStar && !interactive ? 1 : 0)
      stars.push(
        <Star 
          key={`empty-${i}`} 
          className={`h-5 w-5 text-gray-300 ${
            interactive ? 'cursor-pointer hover:text-yellow-400 hover:scale-110 transition-all' : ''
          }`}
          onClick={() => interactive && onRatingChange && onRatingChange(starIndex + 1)}
        />
      )
    }
    
    return stars
  }
  
  const handleAddToCart = () => {
    setIsAddedToCart(true)
    
    // Add to cart using the context
    addToCart(product, {
      size: selectedSize,
      color: selectedColor,
      quantity: quantity
    })
    
    setTimeout(() => setIsAddedToCart(false), 2000)
    console.log('Added to cart:', { product, selectedColor, selectedSize, quantity })
  }
  
  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted)
  }
  
  const handleSubmitReview = (e) => {
    e.preventDefault()
    if (newReview.userName.trim() && newReview.review.trim()) {
      const review = {
        id: reviews.length + 1,
        userName: newReview.userName,
        rating: newReview.rating,
        date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        review: newReview.review,
        verified: false
      }
      setReviews([review, ...reviews])
      setNewReview({ userName: '', rating: 5, review: '' })
      setShowWriteReview(false)
    }
  }


  
  // Mock product images (using the same image for different angles)
  const productImages = [
    product.image,
    product.image,
    product.image,
    product.image
  ]
  
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link to="/" className="hover:text-gray-900">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/products" className="hover:text-gray-900">Shop</Link>
          <ChevronRight className="h-4 w-4" />
          <Link to={`/category?category=casual&subcategory=${product.subcategory}`} className="hover:text-gray-900">
            {product.subcategory}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden">
              <img 
                src={productImages[selectedImage]} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-4">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square bg-gray-100 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === index ? 'border-black' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img 
                    src={image} 
                    alt={`${product.name} view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
          
          {/* Product Info */}
          <div className="space-y-6">
            {/* Title and Rating */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  {renderStars(product.rating.rating)}
                </div>
                <span className="text-sm font-medium">{product.rating.rating}/5</span>
                {product.rating.reviews && (
                  <span className="text-sm text-gray-600">({product.rating.reviews} reviews)</span>
                )}
              </div>
            </div>
            
            {/* Price */}
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-bold text-gray-900">${product.price}</span>
              {product.originalPrice && (
                <>
                  <span className="text-2xl text-gray-500 line-through">${product.originalPrice}</span>
                  {product.discount && (
                    <span className="bg-red-100 text-red-600 text-sm font-medium px-3 py-1 rounded-full">
                      -{product.discount}%
                    </span>
                  )}
                </>
              )}
            </div>
            
            {/* Description */}
            <p className="text-gray-600 leading-relaxed">
              This graphic t-shirt which is perfect for any occasion. Crafted from a soft and breathable fabric, it offers superior comfort and style.
            </p>
            
            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Select Colors</h3>
                <div className="flex space-x-3">
                  {product.colors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                        selectedColor === color ? 'border-gray-900 scale-110' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Choose Size</h3>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedSize(size)}
                      className={`px-6 py-2 border rounded-full text-sm font-medium transition-all hover:border-gray-900 ${
                        selectedSize === size
                          ? 'bg-black text-white border-black'
                          : 'bg-gray-100 text-gray-900 border-gray-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-gray-300 rounded-full">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-gray-100 rounded-l-full transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-3 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-gray-100 rounded-r-full transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 rounded-full font-semibold transition-all duration-300 ${
                    isAddedToCart
                      ? 'bg-green-600 text-white'
                      : 'bg-black text-white hover:bg-gray-800 hover:scale-[1.02]'
                  }`}
                >
                  {isAddedToCart ? (
                    <>
                      <Check className="h-5 w-5" />
                      <span>Added to Cart</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>
              </div>
              
              {/* Wishlist and Share */}
              <div className="flex space-x-3">
                <button
                  onClick={handleWishlist}
                  className={`flex items-center justify-center w-12 h-12 border rounded-full transition-all hover:scale-110 ${
                    isWishlisted
                      ? 'bg-red-50 border-red-200 text-red-600'
                      : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
                <button className="flex items-center justify-center w-12 h-12 border border-gray-300 rounded-full text-gray-600 hover:border-gray-400 hover:scale-110 transition-all">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Product Details Tabs */}
        <div className="mt-16">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { id: 'details', label: 'Product Details' },
                { id: 'reviews', label: 'Rating & Reviews' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-black text-black'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="py-8">
            {activeTab === 'details' && (
              <div className="prose max-w-none">
                <p className="text-gray-600">
                  This {product.name.toLowerCase()} is crafted with attention to detail and quality. 
                  Made from premium materials, it offers both comfort and durability. Perfect for casual wear 
                  or dressing up for special occasions.
                </p>
                <ul className="mt-4 space-y-2 text-gray-600">
                  <li>• Premium quality fabric</li>
                  <li>• Comfortable fit</li>
                  <li>• Machine washable</li>
                  <li>• Available in multiple colors and sizes</li>
                </ul>
              </div>
            )}
            
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {/* Reviews Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <h3 className="text-xl font-semibold">All Reviews ({reviews.length})</h3>
                    <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black">
                      <option>Latest</option>
                      <option>Highest Rating</option>
                      <option>Lowest Rating</option>
                      <option>Most Helpful</option>
                    </select>
                  </div>
                  <button 
                    onClick={() => setShowWriteReview(!showWriteReview)}
                    className="bg-black text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                    Write a Review
                  </button>
                </div>

                {/* Write Review Form */}
                {showWriteReview && (
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <h4 className="text-lg font-semibold mb-4">Write a Review</h4>
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Your Name *
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                          value={newReview.userName}
                          onChange={(e) => setNewReview({...newReview, userName: e.target.value})}
                          placeholder="Enter your name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rating *
                        </label>
                        <div className="flex items-center space-x-1">
                          {renderStars(newReview.rating, true, (rating) => setNewReview({...newReview, rating}))}
                          <span className="ml-2 text-sm text-gray-600">({newReview.rating}/5)</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Your Review *
                        </label>
                        <textarea
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                          value={newReview.review}
                          onChange={(e) => setNewReview({...newReview, review: e.target.value})}
                          placeholder="Share your thoughts about this product..."
                          required
                        />
                      </div>
                      <div className="flex space-x-3">
                        <button
                          type="submit"
                          className="bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors"
                        >
                          Submit Review
                        </button>
                        <button
                          type="button"
                          className="bg-gray-200 text-gray-800 px-6 py-3 rounded-full font-medium hover:bg-gray-300 transition-colors"
                          onClick={() => {
                            setShowWriteReview(false)
                            setNewReview({ userName: '', rating: 5, review: '' })
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Reviews List */}
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-center space-x-3 mb-2">
                            <h5 className="font-semibold text-gray-900">{review.userName}</h5>
                            {review.verified && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                                ✓ Verified
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 mb-3">
                            <div className="flex items-center space-x-1">
                              {renderStars(review.rating)}
                            </div>
                            <span className="text-sm text-gray-500">Posted on {review.date}</span>
                          </div>
                          <p className="text-gray-700 leading-relaxed">{review.review}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Load More Reviews */}
                <div className="text-center pt-6">
                  <button className="text-gray-600 hover:text-black font-medium transition-colors">
                    Load More Reviews
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* You Might Also Like */}
        {recommendedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-center mb-12">You might also like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {recommendedProducts.map((relatedProduct) => (
                <Link key={relatedProduct.id} to={`/product/${relatedProduct.id}`}>
                  <ProductCard 
                    product={relatedProduct}
                    className="hover:scale-105 transition-transform duration-300"
                  />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}