import { useState, useEffect } from 'react'
import { Search, Filter } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { ProductCard } from '../features/catalog'
import { CATEGORIES } from '../constants/products'
import { apiGet } from '../services/apiClient'

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState('newest')
  const [showFilters, setShowFilters] = useState(false)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 24
  const trialMode = searchParams.get('mode') === 'trial'

  // Force scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    document.body.scrollTop = 0
    document.documentElement.scrollTop = 0
  }, [])

  useEffect(() => {
    const urlSearch = searchParams.get('search')
    if (urlSearch && urlSearch !== searchQuery) {
      setSearchQuery(urlSearch)
    }
  }, [searchParams])

  useEffect(() => {
    let mounted = true
    setLoading(true)

    const q = {}
    if (searchQuery) q.search = searchQuery
    if (selectedCategory !== 'All') q.category = selectedCategory
    if (sortBy) q.sort = sortBy
    q.page = page
    q.limit = limit

    const params = Object.entries(q)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&')

    apiGet(`/products?${params}`)
      .then(res => {
        if (!mounted) return
        let apiProducts = res.data || []

        if (searchQuery) {
          const query = searchQuery.toLowerCase()
          apiProducts = apiProducts.filter(p =>
            p.name?.toLowerCase().includes(query) ||
            p.category?.toLowerCase().includes(query) ||
            p.subcategory?.toLowerCase().includes(query)
          )
        }

        if (selectedCategory !== 'All') {
          apiProducts = apiProducts.filter(p =>
            p.category?.toLowerCase() === selectedCategory.toLowerCase() ||
            p.subcategory?.toLowerCase() === selectedCategory.toLowerCase()
          )
        }

        if (sortBy === 'price-low') {
          apiProducts.sort((a, b) => a.price - b.price)
        } else if (sortBy === 'price-high') {
          apiProducts.sort((a, b) => b.price - a.price)
        } else if (sortBy === 'rating') {
          apiProducts.sort((a, b) => (b.rating?.rating || 0) - (a.rating?.rating || 0))
        } else if (sortBy === 'name') {
          apiProducts.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
        } else {
          apiProducts.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        }

        setProducts(apiProducts)
        setTotal(apiProducts.length)
        setLoading(false)
      })
      .catch(err => {
        console.error('API fetch error:', err)
        if (mounted) {
          setProducts([])
          setTotal(0)
          setLoading(false)
        }
      })

    return () => { mounted = false }
  }, [searchQuery, selectedCategory, sortBy, page])

  const handleSearchChange = (value) => {
    setSearchQuery(value)
    setPage(1)
    if (value) setSearchParams({ search: value })
    else setSearchParams({})
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">

      {/* TRIAL MODE BANNER */}
      {trialMode && (
        <div className="bg-black text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📦</span>
                <div>
                  <h3 className="font-bold text-lg">Trial Room Mode</h3>
                  <p className="text-sm opacity-90">Select up to 3 items to try at home</p>
                </div>
              </div>
              <button
                onClick={() => window.location.href = '/trial-room'}
                className="px-4 py-2 bg-white text-black rounded-lg font-semibold text-sm hover:bg-gray-100 transition"
              >
                View Trial Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOP FILTERS */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            {/* SEARCH BAR */}
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full rounded-xl border-2 border-gray-200 py-3.5 pl-12 pr-4 text-sm font-medium focus:border-black focus:outline-none"
              />
              {searchQuery && (
                <button onClick={() => handleSearchChange('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  ✕
                </button>
              )}
            </div>

            {/* CATEGORY & SORT (DESKTOP) */}
            <div className="hidden md:flex items-center gap-3">

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-xl border-2 border-gray-200 px-6 py-3 text-sm font-medium"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-xl border-2 border-gray-200 px-6 py-3 text-sm font-medium"
              >
                <option value="name">Sort by Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>

            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-2xl font-bold">No products found</h3>
          </div>
        ) : (
          <>
            {/* RESULTS HEADER */}
            <div className="mb-8 border-b border-gray-200 pb-6">
              <p className="text-sm text-gray-500">
                Showing <strong>{products.length}</strong> products
              </p>
            </div>

            {/* ⭐ FIXED PRODUCTS GRID ⭐ */}
            <div className="
              grid
              grid-cols-2 
              sm:grid-cols-3 
              lg:grid-cols-4
              gap-6
              sm:gap-8
              lg:gap-10
              items-start
              justify-items-center
            ">
              {products.map((product, index) => (
                <div
                  key={product._id || product.id}
                  className="animate-fadeIn w-full"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <ProductCard
                    product={product}
                    className="w-full"
                    trialMode={trialMode}
                  />
                </div>
              ))}
            </div>

            {/* PAGINATION */}
            <div className="mt-16 flex items-center justify-center gap-3">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-5 py-2.5 border-2 border-gray-200 rounded-xl"
              >
                ← Previous
              </button>

              <span className="text-sm">
                Page {page}
              </span>

              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page * limit >= total}
                className="px-5 py-2.5 border-2 border-gray-200 rounded-xl"
              >
                Next →
              </button>
            </div>
          </>
        )}
      </div>

      {/* Fade-in Animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
      `}</style>

    </div>
  )
}
