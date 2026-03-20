import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react'
import api from '../services/api'

// Import hero images as fallbacks
import heroImg1 from '../assets/9b2990de04e99aa5154207de6d62b46f.jpg'
import heroImg2 from '../assets/4cb1497a8350a0f0cc8239a6845076a4.jpg'
import heroImg3 from '../assets/bcba29523514afda81669aadfc1e6838.jpg'
import heroImg4 from '../assets/b2fa1e773bf84519023d806147eb20ae.jpg'
import heroImg5 from '../assets/ea4cb70a854b3e148ddc9f7c1fae6bf8.jpg'

const FALLBACK_IMAGES = [
  { src: heroImg1, alt: 'Premium streetwear collection' },
  { src: heroImg2, alt: 'Summer fashion essentials' },
  { src: heroImg3, alt: 'Elegant casual wear' },
  { src: heroImg4, alt: 'Couple\'s fashion style' },
  { src: heroImg5, alt: 'Classic black collection' },
]

export default function Hero() {
  const [banners, setBanners] = useState([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [loading, setLoading] = useState(true)
  const [transitioning, setTransitioning] = useState(false)

  // Fetch dynamic banners
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
      } catch {
        setBanners(FALLBACK_IMAGES.map(img => ({ imageUrl: img.src, title: img.alt, link: '/products' })))
      } finally {
        setLoading(false)
      }
    }
    fetchBanners()
  }, [])

  // Auto-scroll
  useEffect(() => {
    if (!isAutoPlaying || banners.length <= 1) return
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [isAutoPlaying, banners])

  const changeSlide = (index) => {
    if (transitioning) return
    setTransitioning(true)
    setCurrentSlide(index)
    setIsAutoPlaying(false)
    setTimeout(() => { setTransitioning(false); setIsAutoPlaying(true) }, 700)
  }

  const goToPrevious = () => changeSlide((currentSlide - 1 + banners.length) % banners.length)
  const goToNext     = () => changeSlide((currentSlide + 1) % banners.length)
  const goToSlide    = (i) => changeSlide(i)

  return (
    <section className="relative w-full overflow-hidden bg-black" style={{ minHeight: 'max(85vh, 600px)' }}>

      {/* Loading */}
      {loading && (
        <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center z-20">
          <ImageIcon className="w-12 h-12 text-neutral-600 animate-pulse" />
        </div>
      )}

      {/* Slides */}
      {banners.map((banner, index) => (
        <div
          key={index}
          className="absolute inset-0 transition-opacity duration-700 ease-in-out"
          style={{ opacity: index === currentSlide ? 1 : 0, zIndex: index === currentSlide ? 1 : 0 }}
          aria-hidden={index !== currentSlide}
        >
          {/* Image with Ken Burns */}
          <div className="absolute inset-0 overflow-hidden">
            <img
              src={banner.imageUrl}
              alt={banner.title || 'Hero Banner'}
              className={`absolute inset-0 h-full w-full object-cover object-center select-none ${
                index === currentSlide ? 'ken-burns' : ''
              }`}
              style={{ maxWidth: 'none', minWidth: '100%', minHeight: '100%' }}
              loading={index === 0 ? 'eager' : 'lazy'}
              draggable="false"
            />
          </div>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-black/20 z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10" />

          {/* Content */}
          <div className="relative z-20 flex h-full items-center" style={{ minHeight: 'inherit' }}>
            <div className="mx-auto w-full max-w-[1400px] px-6 sm:px-10 lg:px-16 py-20">
              <div className="max-w-2xl">
                {/* Eyebrow */}
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-white/70">
                  New Collection
                </p>

                {/* Heading */}
                <h1
                  className="text-5xl font-black text-white uppercase leading-none sm:text-6xl lg:text-7xl"
                  style={{ letterSpacing: '-0.02em' }}
                >
                  FIND CLOTHES<br />
                  THAT MATCH<br />
                  <span className="text-rose-400">YOUR STYLE</span>
                </h1>

                {/* Divider */}
                <div className="mt-6 mb-6 w-16 h-0.5 bg-white/60" />

                {/* Subtext */}
                <p className="text-base text-white/75 max-w-md leading-relaxed font-light">
                  Never suffer a wardrobe emergency again. Your complete look delivered in minutes, exactly when you need it.
                </p>

                {/* CTA */}
                <div className="mt-8 flex items-center gap-4">
                  <Link
                    to={banner.link || '/products'}
                    className="group relative inline-flex items-center overflow-hidden border-2 border-white bg-white px-8 py-3.5 text-sm font-black uppercase tracking-widest text-black transition-all duration-300"
                    style={{ borderRadius: 0 }}
                  >
                    <span className="relative z-10 transition-colors duration-300 group-hover:text-white">Shop Now</span>
                    <span className="absolute inset-0 bg-black scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
                  </Link>
                  <Link
                    to="/new-arrivals"
                    className="inline-flex items-center text-sm font-bold uppercase tracking-widest text-white/80 hover:text-white transition-colors duration-200 link-underline"
                  >
                    New Arrivals →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 flex items-center justify-center bg-white/10 border border-white/30 text-white hover:bg-white hover:text-black transition-all duration-200 backdrop-blur-sm"
            style={{ borderRadius: 0 }}
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 flex items-center justify-center bg-white/10 border border-white/30 text-white hover:bg-white hover:text-black transition-all duration-200 backdrop-blur-sm"
            style={{ borderRadius: 0 }}
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Slide Indicators — thin bar style */}
      {banners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className="transition-all duration-400 h-0.5 hover:opacity-100 opacity-70"
              style={{
                width: index === currentSlide ? '2.5rem' : '1.25rem',
                backgroundColor: '#ffffff',
                borderRadius: 0,
                opacity: index === currentSlide ? 1 : 0.45,
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Slide counter */}
      {banners.length > 1 && (
        <div className="absolute bottom-6 right-8 z-30 text-white/50 text-xs font-mono tracking-widest">
          {String(currentSlide + 1).padStart(2, '0')} / {String(banners.length).padStart(2, '0')}
        </div>
      )}
    </section>
  )
}
