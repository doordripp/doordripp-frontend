import { useState, useEffect } from 'react'
import { Search, Filter } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { ProductCard } from '../features/catalog'
import { CATEGORIES, NEW_ARRIVALS, TOP_SELLING } from '../constants/products'
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

  // Combine products from constants
  const allLocalProducts = [...NEW_ARRIVALS, ...TOP_SELLING]

  // Update search query when URL params change
  useEffect(() => {
    const urlSearch = searchParams.get('search')
    if (urlSearch && urlSearch !== searchQuery) {
      setSearchQuery(urlSearch)
    }
  }, [searchParams])

  // Fetch products - combine API and local products
  useEffect(() => {
    let mounted = true
    
    // Start with local products
    let filteredProducts = [...allLocalProducts]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(query) ||
        (p.category && p.category.toLowerCase().includes(query)) ||
        (p.subcategory && p.subcategory.toLowerCase().includes(query))
      )
    }

    // Apply category filter
    if (selectedCategory && selectedCategory !== 'All') {
      filteredProducts = filteredProducts.filter(p => 
        p.category === selectedCategory.toLowerCase() ||
        p.subcategory === selectedCategory
      )
    }

    // Apply sorting
    if (sortBy === 'price-low') {
      filteredProducts.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price-high') {
      filteredProducts.sort((a, b) => b.price - a.price)
    } else if (sortBy === 'rating') {
      filteredProducts.sort((a, b) => (b.rating?.rating || 0) - (a.rating?.rating || 0))
    } else {
      // Sort by name
      filteredProducts.sort((a, b) => a.name.localeCompare(b.name))
    }

    setProducts(filteredProducts)
    setTotal(filteredProducts.length)
    setLoading(false)

    // Also try to fetch from API and merge (optional)
    const q = {}
    if (searchQuery) q.search = searchQuery
    if (selectedCategory && selectedCategory !== 'All') q.category = selectedCategory
    if (sortBy) q.sort = sortBy
    q.page = page
    q.limit = limit

    const params = Object.entries(q).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')
    apiGet(`/products?${params}`)
      .then(res => {
        if (!mounted) return
        const apiProducts = res.data || []
        // Merge API products with local products (avoid duplicates)
        const allProducts = [...filteredProducts]
        apiProducts.forEach(apiProd => {
          const exists = allProducts.find(p => 
            (p.id === apiProd.id || p._id === apiProd._id || p.name === apiProd.name)
          )
          if (!exists) {
            allProducts.push(apiProd)
          }
        })
        setProducts(allProducts)
        setTotal(allProducts.length)
      })
      .catch(err => {
        console.error('Failed to fetch products from API', err)
        // Keep local products on error
      })

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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Filters and Search Section */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search Bar with enhanced styling */}
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products by name, category, or style..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full rounded-xl border-2 border-gray-200 py-3.5 pl-12 pr-4 text-sm font-medium focus:border-black focus:outline-none focus:ring-4 focus:ring-black/5 transition-all duration-200 placeholder:text-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearchChange('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Toggle (Mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 md:hidden"
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>

            {/* Desktop Filters with enhanced styling */}
            <div className="hidden md:flex items-center gap-3">
              {/* Category Filter */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none rounded-xl border-2 border-gray-200 bg-white px-6 py-3 pr-10 text-sm font-medium focus:border-black focus:outline-none focus:ring-4 focus:ring-black/5 transition-all duration-200 cursor-pointer hover:border-gray-300"
                >
                  <option value="All">All Categories</option>
                  {CATEGORIES.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Sort Filter */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none rounded-xl border-2 border-gray-200 bg-white px-6 py-3 pr-10 text-sm font-medium focus:border-black focus:outline-none focus:ring-4 focus:ring-black/5 transition-all duration-200 cursor-pointer hover:border-gray-300"
                >
                  <option value="name">Sort by Name</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
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

      {/* Products Grid Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
            </div>
            <p className="mt-4 text-gray-500 font-medium">Loading amazing products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No products found</h3>
            <p className="text-lg text-gray-500 text-center max-w-md">
              We couldn't find any products matching your criteria. Try adjusting your filters or search query.
            </p>
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('All')
                setSortBy('name')
              }}
              className="mt-6 px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors duration-200"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            {/* Results Header */}
            <div className="mb-8 flex items-center justify-between border-b border-gray-200 pb-6">
              <div>
                <p className="text-sm text-gray-500">
                  Showing <span className="font-semibold text-gray-900">{products.length}</span> of <span className="font-semibold text-gray-900">{total}</span> products
                </p>
                {searchQuery && (
                  <p className="text-sm text-gray-400 mt-1">
                    Search results for "<span className="font-medium text-gray-600">{searchQuery}</span>"
                  </p>
                )}
              </div>
              
              {/* View toggle could go here */}
            </div>

            {/* Products Grid with Animation */}
            <div className="grid gap-x-5 gap-y-8 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((product, index) => (
                <div
                  key={product._id || product.id}
                  className="animate-fadeIn"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <ProductCard 
                    product={product}
                    onClick={handleProductClick}
                    className="h-full"
                  />
                </div>
              ))}
            </div>

            {/* Enhanced Pagination */}
            <div className="mt-16 flex items-center justify-center gap-2">
              <button
                className="px-5 py-2.5 border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:border-black hover:bg-black hover:text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-transparent disabled:hover:text-gray-700"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                ← Previous
              </button>
              
              <div className="flex items-center gap-2 px-4">
                <span className="text-sm font-medium text-gray-900">Page {page}</span>
                <span className="text-sm text-gray-400">of {Math.ceil(total / limit)}</span>
              </div>
              
              <button
                className="px-5 py-2.5 border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:border-black hover:bg-black hover:text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-transparent disabled:hover:text-gray-700"
                onClick={() => setPage(p => p + 1)}
                disabled={page * limit >= total}
              >
                Next →
              </button>
            </div>
          </>
        )}
      </div>

      {/* Add fadeIn animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  )
}