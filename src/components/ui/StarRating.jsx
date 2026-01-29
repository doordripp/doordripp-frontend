import { Star } from 'lucide-react'

export default function StarRating({ rating, maxStars = 5, size = 20, onRatingChange, interactive = false, className = '' }) {
  const handleStarClick = (starIndex) => {
    if (interactive && onRatingChange) {
      onRatingChange(starIndex + 1)
    }
  }

  const renderStar = (index) => {
    const filled = index < rating
    const isClickable = interactive && onRatingChange
    
    return (
      <button
        key={index}
        type="button"
        onClick={() => handleStarClick(index)}
        disabled={!isClickable}
        className={`${
          isClickable ? 'hover:scale-110 cursor-pointer' : 'cursor-default'
        } transition-transform ${
          filled ? 'text-yellow-400' : 'text-gray-300'
        } ${className}`}
      >
        <Star
          size={size}
          className={filled ? 'fill-current' : ''}
        />
      </button>
    )
  }

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxStars }, (_, index) => renderStar(index))}
    </div>
  )
}