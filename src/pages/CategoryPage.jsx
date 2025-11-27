import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { ChevronDown, ChevronRight, SlidersHorizontal, Grid3X3, List, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react'
import { FILTER_OPTIONS } from '../constants/products'
import { apiGet } from '../services/apiClient'
import { ProductCard } from '../features/catalog'

export default function CategoryPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.get('category') || 'casual'
  const subcategoryFromUrl = searchParams.get('subcategory')
  const priceRangeFromUrl = searchParams.get('priceRange')
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    subcategory: true,
    price: true,
    colors: true,
    size: true,
    dressStyle: true
  })
  const [priceRange, setPriceRange] = useState([50, 200])
  const [selectedFilters, setSelectedFilters] = useState({
    subcategories: subcategoryFromUrl ? [subcategoryFromUrl] : [],
    colors: [],
    sizes: [],
    dressStyles: []
  })
  
  // Initialize filters from URL on mount
  useEffect(() => {
    if (priceRangeFromUrl) {
      const [min, max] = priceRangeFromUrl.split('-').map(Number)
      if (min && max) setPriceRange([min, max])
    }
  }, [priceRangeFromUrl])
  
  // Scroll to top when page loads or category changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [category, subcategoryFromUrl])

  // Fetch products for this category whenever category or page changes
  useEffect(() => {
    let mounted = true
    setLoading(true)
    apiGet(`/products/categories/${encodeURIComponent(category)}?page=${currentPage}&limit=${itemsPerPage}`)
      .then(res => {
        if (!mounted) return
        setProducts(res.data || [])
      })
      .catch(err => console.error('Failed to load category products', err))
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [category, currentPage])
  
  // Scroll to products section
  const scrollToProducts = () => {
    // Small delay to ensure state updates have completed
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 100)
  }
  
  // UI states
  const [viewMode, setViewMode] = useState('grid') // grid or list
  const [sortBy, setSortBy] = useState('most-popular')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9
  
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  // Get products for current category (fetched from backend)
  const categoryProducts = products || []
  
  // Filter products
  const filteredProducts = categoryProducts.filter(product => {
    // Subcategory filter
    if (selectedFilters.subcategories.length > 0) {
      if (!selectedFilters.subcategories.some(sub => 
        product.subcategory.toLowerCase().includes(sub.toLowerCase())
      )) {
        return false
      }
    }
    
    // Price filter
    if (product.price < priceRange[0] || product.price > priceRange[1]) {
      return false
    }
    
    // Color filter
    if (selectedFilters.colors.length > 0) {
      if (!product.colors.some(color => selectedFilters.colors.includes(color))) {
        return false
      }
    }
    
    // Size filter
    if (selectedFilters.sizes.length > 0) {
      if (!product.sizes.some(size => selectedFilters.sizes.includes(size))) {
        return false
      }
    }
    
    return true
  })
  
  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      case 'newest':
        return b.id.localeCompare(a.id)
      case 'rating':
        return b.rating.rating - a.rating.rating
      default: // most-popular
        return b.rating.reviews - a.rating.reviews
    }
  })
  
  // Pagination
  const totalProducts = sortedProducts.length
  const totalPages = Math.ceil(totalProducts / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + itemsPerPage)
  
  // Toggle filter section
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }
  
  // Handle filter changes
  const toggleFilter = (filterType, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(item => item !== value)
        : [...prev[filterType], value]
    }))
    setCurrentPage(1) // Reset to first page
    scrollToProducts()
  }
  
  // Apply price filter
  const handlePriceChange = (newRange) => {
    setPriceRange(newRange)
    setCurrentPage(1)
    scrollToProducts()
  }
  
  // Clear all filters
  const clearFilters = () => {
    setSelectedFilters({
      subcategories: [],
      colors: [],
      sizes: [],
      dressStyles: []
    })
    setPriceRange([50, 200])
    setCurrentPage(1)
    scrollToProducts()
  }
  
  // Breadcrumb
  const getBreadcrumbItems = () => {
    const items = [
      { name: 'Home', href: '/' },
      { name: 'Categories', href: '/category?category=casual' }
    ]
    
    if (selectedFilters.subcategories.length > 0) {
      items.push({ 
        name: selectedFilters.subcategories[0], 
        href: '#' 
      })
    }
    
    return items
  }
  
  const breadcrumbItems = getBreadcrumbItems()
  
  return (
    <div className="min-h-screen bg-white">      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 py-4 text-sm text-gray-600">
          {breadcrumbItems.map((item, index) => (
            <div key={item.name} className="flex items-center">
              {index > 0 && <ChevronRight className="h-4 w-4 mx-2" />}
              <Link 
                to={item.href} 
                className={index === breadcrumbItems.length - 1 
                  ? "text-gray-900 font-medium" 
                  : "hover:text-gray-900"
                }
              >
                {item.name}
              </Link>
            </div>
          ))}
        </nav>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Filters</h2>
                <SlidersHorizontal className="h-5 w-5 text-gray-500" />
              </div>
              
              {/* Filter Sections */}
              <div className="space-y-6">
                {/* Subcategories */}
                <div className="border-b border-gray-200 pb-4">
                  <button
                    onClick={() => toggleSection('subcategory')}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <h3 className="font-medium text-gray-900">Category</h3>
                    <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.subcategory ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedSections.subcategory && (
                    <div className="mt-3 space-y-2">
                      {FILTER_OPTIONS.subcategories.map((subcategory) => (
                        <label key={subcategory.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedFilters.subcategories.includes(subcategory.name)}
                            onChange={() => toggleFilter('subcategories', subcategory.name)}
                            className="rounded border-gray-300 text-black focus:ring-black"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {subcategory.name}
                            <ChevronRight className="inline h-3 w-3 ml-1" />
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Price Range */}
                <div className="border-b border-gray-200 pb-4">
                  <button
                    onClick={() => toggleSection('price')}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <h3 className="font-medium text-gray-900">Price</h3>
                    <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.price ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedSections.price && (
                    <div className="mt-3">
                      <div className="flex items-center space-x-4 mb-4">
                        <input
                          type="range"
                          min="50"
                          max="300"
                          value={priceRange[0]}
                          onChange={(e) => handlePriceChange([parseInt(e.target.value), priceRange[1]])}
                          className="flex-1"
                        />
                        <input
                          type="range"
                          min="50"
                          max="300"
                          value={priceRange[1]}
                          onChange={(e) => handlePriceChange([priceRange[0], parseInt(e.target.value)])}
                          className="flex-1"
                        />
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>${priceRange[0]}</span>
                        <span>${priceRange[1]}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Colors */}
                <div className="border-b border-gray-200 pb-4">
                  <button
                    onClick={() => toggleSection('colors')}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <h3 className="font-medium text-gray-900">Colors</h3>
                    <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.colors ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedSections.colors && (
                    <div className="mt-3 grid grid-cols-5 gap-2">
                      {FILTER_OPTIONS.colors.map((color) => (
                        <button
                          key={color.id}
                          onClick={() => toggleFilter('colors', color.id)}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            selectedFilters.colors.includes(color.id)
                              ? 'border-gray-900 scale-110'
                              : 'border-gray-300 hover:border-gray-400'
                          } ${color.id === 'white' ? 'border-gray-400' : ''}`}
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Sizes */}
                <div className="border-b border-gray-200 pb-4">
                  <button
                    onClick={() => toggleSection('size')}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <h3 className="font-medium text-gray-900">Size</h3>
                    <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.size ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedSections.size && (
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {FILTER_OPTIONS.sizes.map((size) => (
                        <button
                          key={size.id}
                          onClick={() => toggleFilter('sizes', size.short)}
                          className={`px-3 py-2 text-sm border rounded transition-all ${
                            selectedFilters.sizes.includes(size.short)
                              ? 'bg-black text-white border-black'
                              : 'bg-gray-100 text-gray-700 border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {size.short}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Dress Style */}
                <div>
                  <button
                    onClick={() => toggleSection('dressStyle')}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <h3 className="font-medium text-gray-900">Dress Style</h3>
                    <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.dressStyle ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedSections.dressStyle && (
                    <div className="mt-3 space-y-2">
                      {FILTER_OPTIONS.dressStyles.map((style) => (
                        <label key={style.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedFilters.dressStyles.includes(style.id)}
                            onChange={() => toggleFilter('dressStyles', style.id)}
                            className="rounded border-gray-300 text-black focus:ring-black"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {style.name}
                            <ChevronRight className="inline h-3 w-3 ml-1" />
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Apply Filter Button */}
              <button 
                onClick={clearFilters}
                className="w-full mt-6 bg-black text-white py-3 rounded-full hover:bg-gray-800 transition-colors"
              >
                Apply Filter
              </button>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1">
            {/* Header Bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold capitalize">{category}</h1>
                <p className="text-gray-600">
                  Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, totalProducts)} of {totalProducts} Products
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Mobile Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>Filters</span>
                </button>
                
                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="most-popular">Most Popular</option>
                    <option value="newest">Newest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none" />
                </div>
                
                {/* View Mode Toggle */}
                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-black text-white' : 'bg-white text-gray-700'}`}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-black text-white' : 'bg-white text-gray-700'}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Products Grid */}
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" 
              : "space-y-6"
            }>
              {paginatedProducts.map((product) => (
                <ProductCard key={product._id || product.id} product={product} viewMode={viewMode} />
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-200">
                <button
                  onClick={() => {
                    setCurrentPage(prev => Math.max(prev - 1, 1))
                    scrollToProducts()
                  }}
                  disabled={currentPage === 1}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>
                
                <div className="flex space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => {
                        setCurrentPage(page)
                        scrollToProducts()
                      }}
                      className={`px-4 py-2 rounded-lg ${
                        page === currentPage
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => {
                    setCurrentPage(prev => Math.min(prev + 1, totalPages))
                    scrollToProducts()
                  }}
                  disabled={currentPage === totalPages}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <span>Next</span>
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}