import React, { useState, useEffect } from 'react'
import { Star, ThumbsUp, CheckCircle, Upload, X, ChevronDown, Filter } from 'lucide-react'
import { IKContext, IKUpload } from 'imagekitio-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import StarRating from '../ui/StarRating'
import { imagekitConfig, isImageKitConfigured } from '../../config/imagekit'

export default function Reviews({ productId, onReviewSubmitted }) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    rating: 0,
    comment: '',
    images: []
  })

  // Filter state
  const [sortBy, setSortBy] = useState('newest')
  const [filterRating, setFilterRating] = useState('all')

  const isUserLoggedIn = user && (user.id || user._id)

  // Fetch reviews
  const fetchReviews = async () => {
    try {
      setLoading(true)
      const params = {
        page: 1,
        limit: 50,
        sortBy
      }

      if (filterRating !== 'all') {
        params.rating = filterRating
      }

      const response = await api.get(`/reviews/product/${productId}`, { params })
      const { reviews: newReviews, stats: newStats } = response.data

      setReviews(newReviews || [])
      setStats(newStats)
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [productId, sortBy, filterRating])

  const resetForm = () => {
    setShowForm(false)
    setFormData({ rating: 0, comment: '', images: [] })
    setUploadingImage(false)
  }

  // Submit review
  const handleSubmitReview = async (e) => {
    e.preventDefault()

    if (formData.rating === 0 || !formData.comment) {
      alert('Please provide a rating and comment')
      return
    }

    setSubmitting(true)
    try {
      const response = await api.post(`/reviews/product/${productId}`, {
        rating: formData.rating,
        comment: formData.comment,
        images: formData.images
      })

      resetForm()

      // Refresh reviews
      await fetchReviews()

      if (onReviewSubmitted) {
        onReviewSubmitted(response.data.review)
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      alert(error.response?.data?.error || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  // Vote helpful
  const handleVoteHelpful = async (reviewId) => {
    if (!isUserLoggedIn) {
      alert('Please login to vote')
      return
    }

    try {
      await api.post(`/reviews/${reviewId}/vote`, { vote: 'helpful' })
      fetchReviews()
    } catch (error) {
      console.error('Error voting:', error)
    }
  }

  const removeSelectedImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }))
  }

  const validateReviewImage = (file) => {
    const maxSize = 5 * 1024 * 1024
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

    if (!allowedTypes.includes(file.type)) {
      alert('Only JPG, PNG, and WebP images are allowed')
      return false
    }

    if (file.size > maxSize) {
      alert('Each image must be less than 5MB')
      return false
    }

    if (formData.images.length >= 5) {
      alert('You can upload up to 5 photos per review')
      return false
    }

    return true
  }

  const authenticator = async () => {
    const response = await fetch(imagekitConfig.authenticationEndpoint, {
      credentials: 'include'
    })

    if (!response.ok) {
      throw new Error('Failed to get upload authorization')
    }

    const data = await response.json()
    const { signature, expire, token } = data
    return { signature, expire, token }
  }

  // Rating distribution bar
  const RatingBar = ({ stars, count, total }) => {
    const percentage = total > 0 ? (count / total) * 100 : 0
    const isActive = filterRating === stars.toString()
    
    return (
      <button
        onClick={() => setFilterRating(filterRating === stars.toString() ? 'all' : stars.toString())}
        className={`flex items-center gap-3 w-full group hover:bg-gray-100 py-2 px-3 rounded-lg transition-all duration-200 ${
          isActive ? 'bg-gray-100 ring-2 ring-gray-300' : ''
        }`}
      >
        <span className={`text-sm font-semibold w-14 ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
          {stars} star
        </span>
        <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isActive 
                ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' 
                : 'bg-gradient-to-r from-yellow-300 to-yellow-400'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className={`text-sm font-medium w-12 text-right ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
          {count}
        </span>
      </button>
    )
  }

  return (
    <div className="bg-white">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-1">Ratings & Reviews</h2>
          <p className="text-gray-500 text-sm">See what customers are saying</p>
        </div>
        {isUserLoggedIn && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-gray-900 to-black text-white px-8 py-3.5 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 text-sm inline-flex items-center justify-center gap-2 group"
          >
            <Star size={18} className="group-hover:rotate-12 transition-transform duration-200" />
            Write a Review
          </button>
        )}
      </div>

      {/* Review Form - Top */}
      {showForm && (
        <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Share Your Experience</h3>
          <form onSubmit={handleSubmitReview}>
            {/* Rating */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How would you rate this product?
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      size={36}
                      className={`${
                        star <= formData.rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300 hover:text-yellow-300'
                      } transition-colors`}
                    />
                  </button>
                ))}
              </div>
              {formData.rating > 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  {formData.rating === 5
                    ? 'Excellent!'
                    : formData.rating === 4
                    ? 'Very Good'
                    : formData.rating === 3
                    ? 'Good'
                    : formData.rating === 2
                    ? 'Fair'
                    : 'Poor'}
                </p>
              )}
            </div>

            {/* Comment */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Write your review
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none text-gray-700"
                placeholder="What did you like or dislike about this product? How was the quality?"
              />
            </div>

            {/* Add photos */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add photos
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Share up to 5 images (JPG, PNG, WebP, max 5MB each)
              </p>

              {isImageKitConfigured() ? (
                <IKContext
                  publicKey={imagekitConfig.publicKey}
                  urlEndpoint={imagekitConfig.urlEndpoint}
                  authenticator={authenticator}
                >
                  <IKUpload
                    id="review-photo-upload"
                    className="hidden"
                    folder="/reviews"
                    fileName={`review-${productId}-${Date.now()}.jpg`}
                    validateFile={validateReviewImage}
                    onUploadStart={() => setUploadingImage(true)}
                    onSuccess={(res) => {
                      setUploadingImage(false)
                      if (res?.url) {
                        setFormData(prev => ({
                          ...prev,
                          images: prev.images.length < 5 ? [...prev.images, res.url] : prev.images
                        }))
                      }
                    }}
                    onError={(err) => {
                      console.error('Review image upload failed:', err)
                      setUploadingImage(false)
                      alert('Failed to upload image. Please try again.')
                    }}
                  />

                  <label
                    htmlFor="review-photo-upload"
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium transition-colors ${
                      formData.images.length >= 5 || uploadingImage
                        ? 'opacity-50 cursor-not-allowed'
                        : 'cursor-pointer hover:bg-gray-100'
                    }`}
                  >
                    <Upload size={16} />
                    {uploadingImage ? 'Uploading...' : 'Add Photos'}
                  </label>
                </IKContext>
              ) : (
                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 inline-block">
                  Photo upload is temporarily unavailable (ImageKit is not configured).
                </p>
              )}

              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-4">
                  {formData.images.map((imageUrl, index) => (
                    <div key={`${imageUrl}-${index}`} className="relative">
                      <img
                        src={imageUrl}
                        alt={`Review upload ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeSelectedImage(index)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black text-white opacity-90 hover:opacity-100"
                        aria-label={`Remove image ${index + 1}`}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting || formData.rating === 0 || !formData.comment}
                className="bg-black text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Posting...' : 'Post Review'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 text-gray-600 font-medium hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {!isUserLoggedIn && (
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 mb-8 text-center border-2 border-gray-200 shadow-sm">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
            <Star className="text-gray-600" size={28} />
          </div>
          <p className="text-gray-700 font-semibold mb-4 text-lg">Want to share your experience?</p>
          <p className="text-gray-500 text-sm mb-5">Sign in to write a review and help others make informed decisions</p>
          <a
            href="/login"
            className="inline-block bg-gradient-to-r from-gray-900 to-black text-white px-8 py-3.5 rounded-full text-sm font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            Sign in to write a review
          </a>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Rating Summary */}
        <div className="lg:col-span-4">
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border-2 border-gray-200 shadow-md sticky top-24">
            {/* Overall Rating */}
            <div className="text-center mb-6 pb-6 border-b-2 border-gray-200">
              <div className="text-6xl font-extrabold bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent mb-3">
                {stats?.averageRating?.toFixed(1) || '0.0'}
              </div>
              <div className="flex justify-center mb-3">
                <StarRating rating={stats?.averageRating || 0} size={24} />
              </div>
              <p className="text-gray-600 text-sm font-medium">
                Based on {stats?.totalReviews || 0} {stats?.totalReviews === 1 ? 'review' : 'reviews'}
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Rating Breakdown
              </p>
              {[5, 4, 3, 2, 1].map(stars => (
                <RatingBar
                  key={stars}
                  stars={stars}
                  count={stats?.ratingDistribution?.[stars] || 0}
                  total={stats?.totalReviews || 0}
                />
              ))}
            </div>

            {filterRating !== 'all' && (
              <button
                onClick={() => setFilterRating('all')}
                className="w-full mt-5 py-2.5 text-sm text-blue-600 hover:text-white hover:bg-blue-600 font-semibold border-2 border-blue-600 rounded-lg transition-all duration-200"
              >
                Clear filter
              </button>
            )}
          </div>
        </div>

        {/* Right Column - Reviews List */}
        <div className="lg:col-span-8">
          {/* Sort & Filter Bar */}
          <div className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Review Count */}
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-gray-400" />
                <p className="text-gray-700 font-semibold">
                  {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
                  {filterRating !== 'all' && (
                    <span className="text-gray-500 font-normal ml-1">
                      • {filterRating} star{filterRating !== '1' && 's'}
                    </span>
                  )}
                </p>
              </div>
              
              {/* Sort Dropdown */}
              <div className="relative">
                <label htmlFor="sort-reviews" className="sr-only">Sort reviews</label>
                <select
                  id="sort-reviews"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="pl-4 pr-10 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all cursor-pointer appearance-none shadow-sm hover:shadow-md"
                  style={{ minWidth: '180px' }}
                >
                  <option value="newest">Most Recent</option>
                  <option value="highest">Highest Rated</option>
                  <option value="lowest">Lowest Rated</option>
                  <option value="helpful">Most Helpful</option>
                </select>
                <ChevronDown 
                  size={18} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                />
              </div>
            </div>
          </div>

          {/* Reviews List */}
          {loading ? (
            <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-gray-200">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-black mx-auto"></div>
              <p className="text-gray-600 font-medium mt-6">Loading reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-gray-200 shadow-sm">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Star className="text-gray-400" size={40} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Reviews Yet</h3>
              <p className="text-gray-500 max-w-sm mx-auto">Be the first to share your thoughts about this product</p>
            </div>
          ) : (
            <div className="space-y-0 divide-y divide-gray-200 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {reviews.map((review) => (
                <ReviewCard
                  key={review._id}
                  review={review}
                  onVoteHelpful={handleVoteHelpful}
                  currentUserId={user?.id || user?._id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Review Card Component
function ReviewCard({ review, onVoteHelpful, currentUserId }) {
  const isOwnReview = currentUserId === review.user?._id

  return (
    <div className="py-6 px-6 hover:bg-gray-50 transition-colors duration-200">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        {/* Avatar */}
        <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-md">
          {review.user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-gray-900">{review.user?.name || 'Customer'}</span>
            {review.isVerifiedPurchase && (
              <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-semibold border border-green-200">
                <CheckCircle size={13} />
                Verified Buyer
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1.5">
            <StarRating rating={review.rating} size={17} />
            <span className="text-sm text-gray-500 font-medium">
              {new Date(review.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pl-16">
        <p className="text-gray-800 leading-relaxed text-[15px]">{review.comment}</p>

        {Array.isArray(review.images) && review.images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
            {review.images.map((imageUrl, index) => (
              <a
                key={`${review._id}-image-${index}`}
                href={imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl overflow-hidden border-2 border-gray-200 hover:border-gray-400 hover:shadow-md transition-all duration-200 transform hover:scale-105"
              >
                <img
                  src={imageUrl}
                  alt={`Review image ${index + 1}`}
                  className="w-full h-32 object-cover"
                  loading="lazy"
                />
              </a>
            ))}
          </div>
        )}

        {/* Actions */}
        {!isOwnReview && (
          <div className="flex items-center gap-4 mt-5">
            <button
              onClick={() => onVoteHelpful(review._id)}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-black font-medium transition-all duration-200 group hover:bg-gray-100 px-3 py-2 rounded-lg"
            >
              <ThumbsUp size={17} className="group-hover:scale-110 transition-transform duration-200" />
              <span>Helpful</span>
              {review.helpfulVotes > 0 && (
                <span className="bg-gray-200 group-hover:bg-gray-300 text-gray-700 px-2 py-0.5 rounded-full text-xs font-semibold transition-colors">
                  {review.helpfulVotes}
                </span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
