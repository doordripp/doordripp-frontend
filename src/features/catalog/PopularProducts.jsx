import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from './ProductCard'
import { apiGet } from '../../services/apiClient'

export default function PopularProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true

    apiGet('/products?page=1&limit=100')
      .then(res => {
        if (!mounted) return
        const apiProducts = res.data || []

        // Filter featured products
        const featured = apiProducts.filter(p => p.isFeatured === true)

        // Sort by creation date (newest first)
        featured.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0)
          const dateB = new Date(b.createdAt || 0)
          return dateB - dateA
        })

        setProducts(featured.slice(0, 8))
      })
      .catch(err => {
        console.error('Failed to fetch featured products:', err)
        if (mounted) {
          setError('Failed to load featured products. Please try again later.')
          setProducts([])
        }
      })
      .finally(() => mounted && setLoading(false))

    return () => { mounted = false }
  }, [])

  const displayProducts = products

  return (
    <section id="popular-products" className="w-full bg-gray-200 py-12 lg:py-14">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        {/* Section Header - Centered with View All */}
        <div className="mb-14 text-center relative">
          <h2 className="text-4xl font-bold text-black md:text-5xl lg:text-6xl tracking-tight">
            FEATURED PRODUCTS
          </h2>
          <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2">
            <Link
              to="/products"
              className="inline-flex items-center justify-center rounded-full border-2 border-gray-300 bg-white px-10 py-3.5 text-base font-semibold text-black shadow-md transition-all duration-300 hover:bg-black hover:text-white hover:border-black hover:shadow-xl hover:scale-105 active:scale-95"
            >
              View All
            </Link>
          </div>
        </div>

        {/* Products Grid - 6 Products */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading featured products...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No featured products available at the moment.</p>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 max-w-[1400px] mx-auto items-stretch auto-rows-[520px]">
            {displayProducts.map((product) => (
              <ProductCard
                key={product._id || product.id}
                product={product}
                className="mx-auto w-full"
              />
            ))}
          </div>
        )}

        {/* View All Button for Mobile */}
        <div className="mt-14 text-center md:hidden">
          <Link
            to="/products"
            className="inline-flex items-center justify-center rounded-full border-2 border-gray-300 bg-white px-10 py-3.5 text-base font-semibold text-black shadow-md transition-all duration-300 hover:bg-black hover:text-white hover:border-black active:scale-95"
          >
            View All
          </Link>
        </div>
      </div>
    </section>
  )
}
