import React, { useState, useEffect } from 'react'
import { Star, ThumbsUp, CheckCircle, Upload, X, Pencil, Trash2 } from 'lucide-react'
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
  const [updatingReviewId, setUpdatingReviewId] = useState(null)
  const [deletingReviewId, setDeletingReviewId] = useState(null)

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
      // Backend now handles toggle: same vote again removes it.
      await api.post(`/reviews/${reviewId}/vote`, { vote: 'helpful' })
      await fetchReviews()
    } catch (error) {
      console.error('Error voting:', error)
    }
  }

  const handleUpdateReview = async (reviewId, payload) => {
    setUpdatingReviewId(reviewId)
    try {
      await api.put(`/reviews/${reviewId}`, payload)
      await fetchReviews()
      if (onReviewSubmitted) {
        onReviewSubmitted({ _id: reviewId })
      }
      return true
    } catch (error) {
      console.error('Error updating review:', error)
      alert(error.response?.data?.error || 'Failed to update review')
      return false
    } finally {
      setUpdatingReviewId(null)
    }
  }

  const handleDeleteReview = async (reviewId) => {
    const confirmed = window.confirm('Delete this review?')
    if (!confirmed) return

    setDeletingReviewId(reviewId)
    try {
      await api.delete(`/reviews/${reviewId}`)
      await fetchReviews()
      if (onReviewSubmitted) {
        onReviewSubmitted({ _id: reviewId, deleted: true })
      }
    } catch (error) {
      console.error('Error deleting review:', error)
      alert(error.response?.data?.error || 'Failed to delete review')
    } finally {
      setDeletingReviewId(null)
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
    return (
      <button
        onClick={() => setFilterRating(filterRating === stars.toString() ? 'all' : stars.toString())}
        className={`flex items-center gap-3 w-full group hover:bg-gray-100 py-1.5 px-2 rounded-lg transition-colors ${
          filterRating === stars.toString() ? 'bg-gray-100' : ''
        }`}
      >
        <span className="text-sm font-medium w-12 text-gray-700">{stars} star</span>
        <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-yellow-400 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-sm text-gray-500 w-10 text-right">{count}</span>
      </button>
    )
  }

  return (
    <div className="bg-white">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Ratings & Reviews</h2>
        {isUserLoggedIn && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-black text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors text-sm"
          >
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
        <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-center border border-gray-100">
          <p className="text-gray-600 mb-3">Want to share your experience?</p>
          <a
            href="/login"
            className="inline-block bg-black text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors"
          >
            Sign in to write a review
          </a>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Rating Summary */}
        <div className="lg:col-span-4">
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
            {/* Overall Rating */}
            <div className="text-center mb-6 pb-6 border-b border-gray-200">
              <div className="text-5xl font-bold text-gray-900 mb-2">
                {stats?.averageRating?.toFixed(1) || '0.0'}
              </div>
              <div className="flex justify-center mb-2">
                <StarRating rating={stats?.averageRating || 0} size={22} />
              </div>
              <p className="text-gray-500 text-sm">
                {stats?.totalReviews || 0} {stats?.totalReviews === 1 ? 'review' : 'reviews'}
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-1">
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
                className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear filter
              </button>
            )}
          </div>
        </div>

        {/* Right Column - Reviews List */}
        <div className="lg:col-span-8">
          {/* Sort */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600 font-medium">
              {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
              {filterRating !== 'all' && <span className="text-gray-400"> • {filterRating} star</span>}
            </p>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black text-gray-700"
            >
              <option value="newest">Most Recent</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
              <option value="helpful">Most Helpful</option>
            </select>
          </div>

          {/* Reviews List */}
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="text-gray-400" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
              <p className="text-gray-500">Be the first to share your thoughts about this product</p>
            </div>
          ) : (
            <div className="space-y-0 divide-y divide-gray-100">
              {reviews.map((review) => (
                <ReviewCard
                  key={review._id}
                  review={review}
                  onVoteHelpful={handleVoteHelpful}
                  onUpdateReview={handleUpdateReview}
                  onDeleteReview={handleDeleteReview}
                  currentUserId={user?.id || user?._id}
                  updatingReviewId={updatingReviewId}
                  deletingReviewId={deletingReviewId}
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
function ReviewCard({
  review,
  onVoteHelpful,
  onUpdateReview,
  onDeleteReview,
  currentUserId,
  updatingReviewId,
  deletingReviewId
}) {
  const ownId = String(currentUserId || '')
  const reviewUserId = String(review.user?._id || review.user?.id || '')
  const isOwnReview = ownId && ownId === reviewUserId
  const [isEditing, setIsEditing] = useState(false)
  const [editRating, setEditRating] = useState(review.rating || 0)
  const [editComment, setEditComment] = useState(review.comment || '')
  const [editImages, setEditImages] = useState(Array.isArray(review.images) ? review.images : [])
  const [uploadingEditImage, setUploadingEditImage] = useState(false)

  const userHelpfulVote = Array.isArray(review.votedUsers) && review.votedUsers.some(v => {
    const voteUserId = String(v?.user?._id || v?.user || '')
    return voteUserId === ownId && v?.vote === 'helpful'
  })

  const isUpdatingThisReview = updatingReviewId === review._id
  const isDeletingThisReview = deletingReviewId === review._id

  useEffect(() => {
    setEditRating(review.rating || 0)
    setEditComment(review.comment || '')
    setEditImages(Array.isArray(review.images) ? review.images : [])
  }, [review.rating, review.comment, review.images])

  const handleSaveEdit = async () => {
    if (editRating === 0 || !editComment.trim()) {
      alert('Please provide a rating and comment')
      return
    }
    const ok = await onUpdateReview(review._id, {
      rating: editRating,
      comment: editComment.trim(),
      images: editImages
    })
    if (ok) {
      setIsEditing(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditRating(review.rating || 0)
    setEditComment(review.comment || '')
    setEditImages(Array.isArray(review.images) ? review.images : [])
    setUploadingEditImage(false)
  }

  const validateEditImage = (file) => {
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

    if (editImages.length >= 5) {
      alert('You can upload up to 5 photos per review')
      return false
    }

    return true
  }

  const editImageAuthenticator = async () => {
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

  return (
    <div className="py-6">
      {/* Header */}
      <div className="flex items-start gap-4 mb-3">
        {/* Avatar */}
        <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
          {review.user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900">{review.user?.name || 'Customer'}</span>
            {review.isVerifiedPurchase && (
              <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
                <CheckCircle size={12} />
                Verified Buyer
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <StarRating rating={review.rating} size={16} />
            <span className="text-sm text-gray-400">
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
        {isEditing ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setEditRating(star)}
                    className="p-0.5"
                  >
                    <Star
                      size={20}
                      className={`${
                        star <= editRating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review
              </label>
              <textarea
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
              />
            </div>
            {editImages.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Photos</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {editImages.map((imageUrl, index) => (
                    <div key={`${imageUrl}-${index}`} className="relative">
                      <img
                        src={imageUrl}
                        alt={`Review image ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => setEditImages(prev => prev.filter((_, i) => i !== index))}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black text-white"
                        aria-label={`Remove image ${index + 1}`}
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="mb-4">
              {isImageKitConfigured() ? (
                <IKContext
                  publicKey={imagekitConfig.publicKey}
                  urlEndpoint={imagekitConfig.urlEndpoint}
                  authenticator={editImageAuthenticator}
                >
                  <IKUpload
                    id={`review-edit-photo-upload-${review._id}`}
                    className="hidden"
                    folder="/reviews"
                    fileName={`review-edit-${review._id}-${Date.now()}.jpg`}
                    validateFile={validateEditImage}
                    onUploadStart={() => setUploadingEditImage(true)}
                    onSuccess={(res) => {
                      setUploadingEditImage(false)
                      if (res?.url) {
                        setEditImages(prev => (prev.length < 5 ? [...prev, res.url] : prev))
                      }
                    }}
                    onError={(err) => {
                      console.error('Review edit image upload failed:', err)
                      setUploadingEditImage(false)
                      alert('Failed to upload image. Please try again.')
                    }}
                  />
                  <label
                    htmlFor={`review-edit-photo-upload-${review._id}`}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium transition-colors ${
                      editImages.length >= 5 || uploadingEditImage
                        ? 'opacity-50 cursor-not-allowed'
                        : 'cursor-pointer hover:bg-gray-100'
                    }`}
                  >
                    <Upload size={14} />
                    {uploadingEditImage ? 'Uploading...' : 'Add Photos'}
                  </label>
                </IKContext>
              ) : (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 inline-block">
                  Photo upload is unavailable (ImageKit is not configured).
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={isUpdatingThisReview}
                className="px-4 py-2 text-sm font-semibold bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
              >
                {isUpdatingThisReview ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={isUpdatingThisReview}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-gray-700 leading-relaxed">{review.comment}</p>

            {Array.isArray(review.images) && review.images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                {review.images.map((imageUrl, index) => (
                  <a
                    key={`${review._id}-image-${index}`}
                    href={imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-lg overflow-hidden border border-gray-200 hover:opacity-90 transition-opacity"
                  >
                    <img
                      src={imageUrl}
                      alt={`Review image ${index + 1}`}
                      className="w-full h-28 object-cover"
                      loading="lazy"
                    />
                  </a>
                ))}
              </div>
            )}
          </>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 mt-4">
          {!isOwnReview && (
            <button
              onClick={() => onVoteHelpful(review._id)}
              className={`flex items-center gap-2 text-sm transition-colors group ${
                userHelpfulVote ? 'text-blue-700' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <ThumbsUp
                size={16}
                className={`group-hover:scale-110 transition-transform ${userHelpfulVote ? 'fill-blue-700' : ''}`}
              />
              <span>Helpful</span>
              {review.helpfulVotes > 0 && (
                <span className="text-gray-400">({review.helpfulVotes})</span>
              )}
            </button>
          )}

          {isOwnReview && !isEditing && (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"
              >
                <Pencil size={14} />
                Edit
              </button>
              <button
                type="button"
                onClick={() => onDeleteReview(review._id)}
                disabled={isDeletingThisReview}
                className="inline-flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                <Trash2 size={14} />
                {isDeletingThisReview ? 'Deleting...' : 'Delete'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
