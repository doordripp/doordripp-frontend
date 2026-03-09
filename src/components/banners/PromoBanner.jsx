import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../../services/api'

/**
 * PromoBanner Component
 * 
 * Displays promotional banners uploaded from admin panel
 * Features:
 * - Auto-rotating carousel
 * - Manual navigation
 * - Click to navigate to banner link
 * - Responsive design
 */
export default function PromoBanner() {
  const [banners, setBanners] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        // Fetch ALL banners first, then filter strictly on frontend
        const response = await api.get('/content/banners?activeOnly=true')
        const allBanners = response.data?.banners || []

        // STRICT filtering: only show banners that explicitly have platform='website'
        const websiteBanners = allBanners.filter(b =>
          b.isActive &&
          b.platform === 'website' &&
          b.platform !== undefined &&
          b.platform !== null
        )

        console.log('All banners:', allBanners)
        console.log('Website banners after filtering:', websiteBanners)

        setBanners(websiteBanners)
      } catch (error) {
        console.error('Failed to fetch banners:', error)
        setBanners([])
      } finally {
        setLoading(false)
      }
    }

    fetchBanners()
  }, [])

  // Auto-rotate banners every 5 seconds
  useEffect(() => {
    if (banners.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [banners.length])

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length)
  }

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl border-4 border-gray-300 aspect-video animate-pulse">
          <div className="w-full h-full bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    )
  }

  if (banners.length === 0) {
    return null // Don't show anything if no banners
  }

  const currentBanner = banners[currentIndex]

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Card Container with Border and Shadow */}
      <div className="bg-white rounded-3xl shadow-2xl border-4 border-gray-300 overflow-hidden group">
        {/* Banner Image with Link */}
        <div className="relative aspect-video">
          <Link to={currentBanner.link || '/products'} className="block h-full">
            <img
              src={currentBanner.imageUrl}
              alt={currentBanner.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </Link>

          {/* Navigation Buttons - Only show if multiple banners */}
          {banners.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-all duration-200 opacity-0 group-hover:opacity-100"
                aria-label="Previous banner"
              >
                <ChevronLeft className="w-5 h-5 text-gray-800" />
              </button>

              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-all duration-200 opacity-0 group-hover:opacity-100"
                aria-label="Next banner"
              >
                <ChevronRight className="w-5 h-5 text-gray-800" />
              </button>

              {/* Dots Indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {banners.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex
                        ? 'bg-white w-6'
                        : 'bg-white/60 hover:bg-white/80'
                      }`}
                    aria-label={`Go to banner ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Banner Title Overlay */}
          {currentBanner.title && currentBanner.title !== 'Promo Banner' && (
            <div className="absolute bottom-8 left-8 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-lg">
              <h3 className="text-lg font-bold">{currentBanner.title}</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
