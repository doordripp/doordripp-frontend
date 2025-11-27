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
  const [sortBy, setSortBy] = useState('name')
  const [showFilters, setShowFilters] = useState(false)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 24

  // Update search query when URL params change
  useEffect(() => {
    const urlSearch = searchParams.get('search')
    if (urlSearch && urlSearch !== searchQuery) {
      setSearchQuery(urlSearch)
    }
  }, [searchParams])

  // Fetch products from backend when filters change
  useEffect(() => {
    let mounted = true
    const q = {}
    if (searchQuery) q.search = searchQuery
    if (selectedCategory && selectedCategory !== 'All') q.category = selectedCategory
    if (sortBy) q.sort = sortBy
    q.page = page
    q.limit = limit

    setLoading(true)
    const params = Object.entries(q).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')
    apiGet(`/products?${params}`)
      .then(res => {
        if (!mounted) return
        setProducts(res.data || [])
        setTotal((res.meta && res.meta.total) || 0)
      })
      .catch(err => {
        console.error('Failed to fetch products', err)
        if (mounted) setProducts([])
      })
      .finally(() => mounted && setLoading(false))

    return () => { mounted = false }
  }, [searchQuery, selectedCategory, sortBy, page])

  const handleProductClick = (product) => {
    // navigate to product detail - currently kept as TODO
    console.log('Product clicked:', product)
  }

  const handleSearchChange = (value) => {
    setSearchQuery(value)
    setPage(1)
    // Update URL params
    if (value) {
      setSearchParams({ search: value })
    } else {
      setSearchParams({})
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-black md:text-5xl lg:text-6xl">
            All Products
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Discover our complete collection of premium clothing
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white py-6 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full rounded-full border border-gray-200 py-3 pl-10 pr-4 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10 transition-all duration-200"
              />
            </div>

            {/* Filter Toggle (Mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 md:hidden"
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>

            {/* Desktop Filters */}
            <div className="hidden md:flex items-center gap-4">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-full border border-gray-200 px-4 py-2 focus:border-black focus:outline-none"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              {/* Sort Filter */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-full border border-gray-200 px-4 py-2 focus:border-black focus:outline-none"
              >
                <option value="name">Sort by Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Mobile Filters */}
          {showFilters && (
            <div className="mt-4 space-y-4 md:hidden">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-full border border-gray-200 px-4 py-2 focus:border-black focus:outline-none"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full rounded-full border border-gray-200 px-4 py-2 focus:border-black focus:outline-none"
              >
                <option value="name">Sort by Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="text-center py-16"><p>Loading...</p></div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-gray-500">No products found matching your criteria.</p>
          </div>
        ) : (
          <>
            <div className="mb-8 flex items-center justify-between">
              <p className="text-gray-600">
                Showing {products.length} of {total} products
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard 
                  key={product._id || product.id} 
                  product={product}
                  onClick={handleProductClick}
                  className="mx-auto w-full max-w-[295px]"
                />
              ))}
            </div>

            {/* Pagination controls (simple) */}
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                className="px-4 py-2 border rounded"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
              >Prev</button>
              <span>Page {page}</span>
              <button
                className="px-4 py-2 border rounded"
                onClick={() => setPage(p => p + 1)}
                disabled={page * limit >= total}
              >Next</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}