import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from './ProductCard'
import { apiGet } from '../../services/apiClient'
import useScrollReveal from '../../hooks/useScrollReveal'

export default function TopSelling() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const headerRef = useScrollReveal({ self: true })

  useEffect(() => {
    let mounted = true
    apiGet('/products?page=1&limit=100')
      .then(res => {
        if (!mounted) return
        const apiProducts = res.data || []
        const bestSellers = apiProducts.filter(p => p.isBestSeller === true)
        bestSellers.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        setProducts(bestSellers.slice(0, 8))
      })
      .catch(err => { console.error('Failed to fetch best sellers:', err); if (mounted) setProducts([]) })
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [])

  return (
    <section id="top-selling" className="w-full bg-neutral-50 py-16 lg:py-20">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12 flex items-end justify-between reveal" ref={headerRef}>
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tight text-black md:text-4xl lg:text-5xl">
              Best Sellers
            </h2>
            <div className="mt-3 w-12 h-0.5 bg-black" />
          </div>
          <Link
            to="/best-sellers"
            className="hidden md:inline-flex items-center border-b-2 border-black pb-0.5 text-xs font-black uppercase tracking-widest text-black hover:opacity-60 transition-opacity duration-200"
          >
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-1 grid-cols-2 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-[520px] bg-neutral-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid gap-1 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 items-stretch auto-rows-[520px]">
            {products.map((product, i) => (
              <div
                key={product._id || product.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}
              >
                <ProductCard product={product} className="mx-auto w-full" />
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 text-center md:hidden">
          <Link
            to="/best-sellers"
            className="inline-flex items-center border-b-2 border-black pb-0.5 text-xs font-black uppercase tracking-widest text-black"
          >
            View All →
          </Link>
        </div>
      </div>
    </section>
  )
}