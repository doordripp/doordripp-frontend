import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react'
import axios from 'axios'
import api from '../services/api'

// Import hero images as fallbacks/placeholders
import heroImg1 from '../assets/9b2990de04e99aa5154207de6d62b46f.jpg'
import heroImg2 from '../assets/4cb1497a8350a0f0cc8239a6845076a4.jpg'
import heroImg3 from '../assets/bcba29523514afda81669aadfc1e6838.jpg'
import heroImg4 from '../assets/b2fa1e773bf84519023d806147eb20ae.jpg'
import heroImg5 from '../assets/ea4cb70a854b3e148ddc9f7c1fae6bf8.jpg'

const FALLBACK_IMAGES = [
  { src: heroImg1, alt: "Premium streetwear collection" },
  { src: heroImg2, alt: "Summer fashion essentials" },
  { src: heroImg3, alt: "Elegant casual wear" },
  { src: heroImg4, alt: "Couple's fashion style" },
  { src: heroImg5, alt: "Classic black collection" }
]

function Star({ className }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path fill="currentColor" d="M12 2c.5 3.6 2.4 5.5 6 6-3.6.5-5.5 2.4-6 6-.5-3.6-2.4-5.5-6-6 3.6-.5 5.5-2.4 6-6Z" />
    </svg>
  )
}

export default function Hero() {
  const [banners, setBanners] = useState([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [loading, setLoading] = useState(true)

  // Fetch dynamic banners from backend
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true)
        const response = await api.get('/content/banners?activeOnly=true&platform=website')
        if (response.data.success && response.data.banners.length > 0) {
          setBanners(response.data.banners)
        } else {
          setBanners(FALLBACK_IMAGES.map(img => ({ imageUrl: img.src, title: img.alt, link: '/products' })))
        }
      } catch (err) {
        console.error('Failed to fetch banners:', err)
        setBanners(FALLBACK_IMAGES.map(img => ({ imageUrl: img.src, title: img.alt, link: '/products' })))
      } finally {
        setLoading(false)
      }
    }
    fetchBanners()
  }, [])

  // Auto-scroll functionality
  useEffect(() => {
    if (!isAutoPlaying || banners.length <= 1) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, banners])

  const goToSlide = (index) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  return (
    <section className="w-full bg-gray-200 overflow-hidden min-h-[360px] md:min-h-[400px] lg:min-h-[450px]">
      <div className="relative grid w-full max-w-[1400px] grid-cols-1 items-center gap-8 md:grid-cols-2 mx-auto h-full px-4 sm:px-6 lg:px-8">
        {/* Left copy */}
        <div className="py-8 md:py-12 lg:py-16 flex flex-col justify-center">
          <div className="space-y-6">
            <h1 className="text-5xl font-extrabold text-black md:text-6xl lg:text-7xl leading-tight">
              FIND CLOTHES
              <br />
              THAT MATCHES
              <br />
              YOUR STYLE
            </h1>
            <div className="w-16 h-1 bg-black rounded-full"></div>
            <p className="text-black text-base md:text-lg max-w-lg opacity-80">
              Never suffer a wardrobe emergency again. Get your complete look delivered to your
              door in mere minutes, exactly when you need it.
            </p>
            <div className="pt-2">
              <Link
                to="/products"
                className="inline-block bg-black text-white px-10 py-4 rounded-full font-semibold text-base hover:bg-gray-900 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </div>

        {/* Right image carousel */}
        <div className="relative flex w-full items-center justify-center py-6 md:py-8 lg:py-12 overflow-visible">
          <div className="relative w-full max-w-[320px] md:max-w-[360px] lg:max-w-[400px] group">
            {/* Card container with animation */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-3xl hover:-translate-y-2 ring-4 ring-black">
              {/* Image carousel wrapper - edge to edge */}
              <div className="relative overflow-hidden">
                {/* Images container */}
                <div className="relative w-full h-[360px] md:h-[400px] lg:h-[440px] bg-gray-100">
                  {banners.map((banner, index) => (
                    <Link
                      key={index}
                      to={banner.link || '/products'}
                      className={`absolute inset-0 transition-all duration-700 ease-in-out ${index === currentSlide
                          ? 'opacity-100 scale-100 z-10'
                          : 'opacity-0 scale-95 z-0 pointer-events-none'
                        }`}
                    >
                      <img
                        src={banner.imageUrl}
                        alt={banner.title || 'Promo Banner'}
                        className="block h-full w-full object-cover object-center select-none"
                        loading={index === 0 ? "eager" : "lazy"}
                        draggable="false"
                      />
                    </Link>
                  ))}

                  {/* Loading Placeholder */}
                  {loading && (
                    <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center z-40">
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                    </div>
                  )}

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 pointer-events-none"></div>
                </div>

                {/* Navigation arrows */}
                {banners.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.preventDefault(); goToPrevious(); }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-30 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
                      aria-label="Previous slide"
                    >
                      <ChevronLeft className="h-5 w-5 text-black" />
                    </button>
                    <button
                      onClick={(e) => { e.preventDefault(); goToNext(); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-30 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
                      aria-label="Next slide"
                    >
                      <ChevronRight className="h-5 w-5 text-black" />
                    </button>
                  </>
                )}

                {/* Dots indicator */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
                  {banners.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => { e.preventDefault(); goToSlide(index); }}
                      className={`transition-all duration-300 rounded-full ${index === currentSlide
                          ? 'bg-white w-8 h-2'
                          : 'bg-white/60 hover:bg-white/80 w-2 h-2'
                        }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Card shadow/border effects */}
            <div className="absolute -inset-1 -z-10 rounded-3xl bg-gradient-to-br from-neutral-200/50 to-neutral-300/30 blur-lg opacity-60 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Subtle accent lines */}
            <div className="absolute -top-3 -left-3 w-20 h-20 border-t-4 border-l-4 border-black/10 rounded-tl-3xl transition-all duration-500 group-hover:w-24 group-hover:h-24 group-hover:border-black/20"></div>
            <div className="absolute -bottom-3 -right-3 w-20 h-20 border-b-4 border-r-4 border-black/10 rounded-br-3xl transition-all duration-500 group-hover:w-24 group-hover:h-24 group-hover:border-black/20"></div>

            {/* Decorative star elements */}
            <div className="absolute right-6 top-12 text-gray-400/40 pointer-events-none animate-pulse">
              <Star className="h-5 w-5" />
            </div>
            <div className="absolute left-6 bottom-16 text-gray-400/40 pointer-events-none animate-pulse" style={{ animationDelay: '1s' }}>
              <Star className="h-7 w-7" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
