import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from './ProductCard'
import { apiGet } from '../../services/apiClient'
import useScrollReveal from '../../hooks/useScrollReveal'

export default function NewArrivals() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const headerRef = useScrollReveal({ self: true })

  useEffect(() => {
    let mounted = true
    apiGet('/products?page=1&limit=100')
      .then(res => {
        if (!mounted) return
        const apiProducts = res.data || []
        const newArrivals = apiProducts.filter(p => p.isNewArrival === true)
        newArrivals.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        setProducts(newArrivals.slice(0, 5))
      })
      .catch(err => { console.error('Failed to fetch new arrivals:', err); if (mounted) setProducts([]) })
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [])

  const heroProduct = products[0]
  const sideProducts = products.slice(1, 5)

  return (
    <section id="new-arrivals" className="w-full bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">

        {/* Section Header — editorial centered */}
        <div className="mb-14 text-center reveal" ref={headerRef}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-neutral-400 mb-3">
            Just Dropped
          </p>
          <h2 className="text-4xl font-black uppercase tracking-tight text-black md:text-5xl lg:text-6xl">
            New Arrivals
          </h2>
          <div className="mx-auto mt-4 w-10 h-[2px] bg-black" />
        </div>

        {loading ? (
          <div className="grid gap-1 grid-cols-2 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-[520px] bg-neutral-100 animate-pulse" />
            ))}
          </div>
        ) : (
          /* Asymmetric Bento-style grid:
             Left = 1 large hero card (2 rows tall)
             Right = 2×2 grid of smaller cards */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-1">
            {/* LEFT — Hero Featured Product */}
            {heroProduct && (
              <div
                className="animate-fade-in-up lg:row-span-2"
                style={{ animationDelay: '0ms', animationFillMode: 'both' }}
              >
                <div className="group h-full bg-white border border-gray-100 hover:border-gray-300 hover:shadow-2xl transition-all duration-400 overflow-hidden flex flex-col" style={{ borderRadius: 0 }}>
                  <Link to={`/product/${heroProduct.id || heroProduct._id || heroProduct.slug}`} className="block relative overflow-hidden" style={{ height: '70%', minHeight: '420px' }}>
                    <img
                      src={heroProduct.images?.[0] || heroProduct.image}
                      alt={heroProduct.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      style={{ maxWidth: 'none' }}
                    />
                    {heroProduct.discount && (
                      <span className="absolute left-0 top-5 bg-rose-600 text-white px-3 py-1.5 text-[11px] font-black tracking-widest uppercase" style={{ borderRadius: 0 }}>
                        -{heroProduct.discount}%
                      </span>
                    )}
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </Link>
                  <div className="flex flex-col flex-1 p-6 justify-center">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-400 mb-2">Featured</p>
                    <h3 className="text-xl font-black text-black uppercase tracking-tight mb-2 line-clamp-2">{heroProduct.name}</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-black text-black">₹{heroProduct.price}</span>
                      {heroProduct.originalPrice && (
                        <span className="text-sm text-gray-400 line-through">₹{heroProduct.originalPrice}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* RIGHT — 2×2 smaller cards */}
            <div className="grid grid-cols-2 gap-1">
              {sideProducts.map((product, i) => (
                <div
                  key={product._id || product.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${(i + 1) * 80}ms`, animationFillMode: 'both' }}
                >
                  <ProductCard product={product} className="mx-auto w-full" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View All CTA */}
        <div className="mt-12 text-center animate-fade-in-up" style={{ animationDelay: '500ms', animationFillMode: 'both' }}>
          <Link
            to="/new-arrivals"
            className="inline-block border-2 border-black px-10 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-black hover:bg-black hover:text-white transition-all duration-300"
            style={{ borderRadius: 0 }}
          >
            View All New Arrivals →
          </Link>
        </div>
      </div>
    </section>
  )
}