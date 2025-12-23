import React, { useEffect, useState } from 'react'
import ProductCard from '../../features/catalog/ProductCard'

// This component avoids static imports of swiper so the app won't fail
// when `swiper` is not installed. It dynamically loads Swiper at runtime
// and falls back to a horizontally scrollable list if import fails.
export default function RecommendedCarousel({ products = [] }) {
  const [swiperModules, setSwiperModules] = useState(null)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const mod = await import('swiper/react')
        const base = await import('swiper')
        // import css only when swiper is available
        await import('swiper/css')
        await import('swiper/css/navigation')
        await import('swiper/css/pagination')

        if (!cancelled) {
          setSwiperModules({ React: mod, core: base })
        }
      } catch (err) {
        // Swiper not installed or failed to load — we'll fallback to simple list
        // Keep a console warning for debugging
        // eslint-disable-next-line no-console
        console.warn('Swiper not available, using fallback list:', err && err.message)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  if (!products || products.length === 0) return null

  // If Swiper loaded, render it. Be defensive: some Swiper builds may not
  // export module functions as expected, so verify before passing to Swiper.
  if (swiperModules && swiperModules.React) {
    try {
      const { Swiper, SwiperSlide } = swiperModules.React
      const core = swiperModules.core || {}

      const hasNavigation = typeof core.Navigation === 'function'
      const hasPagination = typeof core.Pagination === 'function'
      const hasA11y = typeof core.A11y === 'function'

      // If modules are available, use them; otherwise render a basic Swiper
      if (hasNavigation || hasPagination || hasA11y) {
        const { Navigation, Pagination, A11y } = core
        return (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Recommended for you</h3>
            <Swiper
              modules={[Navigation, Pagination, A11y].filter(Boolean)}
              spaceBetween={16}
              slidesPerView={1}
              navigation={hasNavigation}
              pagination={hasPagination ? { clickable: true } : false}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
                1280: { slidesPerView: 4 },
              }}
            >
              {products.map((p) => (
                <SwiperSlide key={p.id || p._id}>
                  <div className="h-full">
                    <ProductCard product={p} showAddToCart initialImageIndex={0} className="h-full" />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )
      }

      // Basic Swiper without modules
      return (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Recommended for you</h3>
          <Swiper spaceBetween={16} slidesPerView={1} breakpoints={{640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 }, 1280: { slidesPerView: 4 },}}>
            {products.map((p) => (
              <swiperModules.React.SwiperSlide key={p.id || p._id}>
                <div className="h-full">
                  <ProductCard product={p} showAddToCart initialImageIndex={0} className="h-full" />
                </div>
              </swiperModules.React.SwiperSlide>
            ))}
          </Swiper>
        </div>
      )
    } catch (err) {
      // If anything goes wrong rendering Swiper, log and fall through to fallback list
      // eslint-disable-next-line no-console
      console.warn('Error rendering Swiper, falling back to list:', err && err.message)
    }
  }

  // Fallback: simple horizontally scrollable list
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-3">Recommended for you</h3>
      <div className="-mx-2 overflow-x-auto py-2">
        <div className="flex gap-4 px-2">
          {products.map((p) => (
            <div key={p.id || p._id} className="w-56 flex-shrink-0">
              <ProductCard product={p} showAddToCart initialImageIndex={0} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
