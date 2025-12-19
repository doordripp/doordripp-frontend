import { useState, useEffect } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronRight, SlidersHorizontal, X } from 'lucide-react'
import { FILTER_OPTIONS } from '../constants/products'
import { apiGet } from '../services/apiClient'
import { ProductCard } from '../features/catalog'

export default function CategoryPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const category = searchParams.get('category') || searchParams.get('gender') || 'casual'
  const gender = searchParams.get('gender')
  const subcategoryFromUrl = searchParams.get('subcategory')
  const priceRangeFromUrl = searchParams.get('priceRange')
  
  // UI states - declare BEFORE useEffect
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 50
  
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    subcategory: true,
    price: true,
    colors: true,
    size: true,
    dressStyle: true
  })
  const [priceRange, setPriceRange] = useState([0, 10000])
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
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [category, subcategoryFromUrl])

  // Fetch products for this category whenever category or page changes
  useEffect(() => {
    let mounted = true
    setLoading(true)
    
    // Determine the category to filter by
    let categoryFilter = null
    if (gender === 'men' || category === 'men') {
      categoryFilter = 'Men'
    } else if (gender === 'women' || category === 'women') {
      categoryFilter = 'Women'
    } else if (category === 'accessories') {
      categoryFilter = 'Accessories'
    } else if (category === 'footwear') {
      categoryFilter = 'Footwear'
    }
    
    // Fetch products from API - get ALL products
    apiGet(`/products?limit=200`)
      .then(res => {
        if (!mounted) return
        
        // Handle different response structures
        let apiProducts = []
        if (res.data) {
          if (Array.isArray(res.data)) {
            apiProducts = res.data
          } else if (res.data.products && Array.isArray(res.data.products)) {
            apiProducts = res.data.products
          }
        }
        
        // Filter API products by category
        if (categoryFilter) {
          apiProducts = apiProducts.filter(p => 
            p.category?.toLowerCase() === categoryFilter.toLowerCase()
          )
        }
        
        console.log('Category:', categoryFilter)
        console.log('Total products loaded:', apiProducts.length)
        
        // If subcategory specified, filter
        if (subcategoryFromUrl) {
          const filtered = apiProducts.filter(p =>
            p.subcategory?.toLowerCase() === subcategoryFromUrl.toLowerCase()
          )
          setProducts(filtered)
        } else {
          setProducts(apiProducts)
        }
        
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load products from API:', err)
        setProducts([])
        setLoading(false)
      })
    
    return () => { mounted = false }
  }, [category, currentPage, subcategoryFromUrl, gender])

  // Get products for current category (fetched from backend)
  const categoryProducts = products || []
  
  // Filter products
  const filteredProducts = categoryProducts.filter(product => {
    // Subcategory filter
    if (selectedFilters.subcategories.length > 0) {
      if (!product.subcategory || !selectedFilters.subcategories.some(sub => 
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
      if (!product.colors || !product.colors.some(color => selectedFilters.colors.includes(color))) {
        return false
      }
    }
    
    // Size filter
    if (selectedFilters.sizes.length > 0) {
      if (!product.sizes || !product.sizes.some(size => selectedFilters.sizes.includes(size))) {
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
        // Sort by createdAt date (newest first)
        const dateA = new Date(a.createdAt || 0)
        const dateB = new Date(b.createdAt || 0)
        return dateB - dateA
      case 'rating':
        return (b.rating?.rating || 0) - (a.rating?.rating || 0)
      default: // most-popular - also sort by newest first by default
        const createdA = new Date(a.createdAt || 0)
        const createdB = new Date(b.createdAt || 0)
        return createdB - createdA
    }
  })
  
  // Pagination
  const totalProducts = sortedProducts.length
  const totalPages = Math.ceil(totalProducts / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + itemsPerPage)
  
  // Scroll to products section
  const scrollToProducts = () => {
    window.scrollTo({ top: 300, behavior: 'smooth' })
  }
  
  // Toggle filter section
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }
  
  // Handle filter changes
  const toggleFilter = (filterType, value) => {
    // If filtering by main category (Men, Women, Accessories, Footwear), navigate instead
    if (filterType === 'categories') {
      const categoryMap = {
        'Men': '/category?gender=men',
        'Women': '/category?gender=women',
        'Accessories': '/category?category=accessories',
        'Footwear': '/category?category=footwear'
      }
      if (categoryMap[value]) {
        navigate(categoryMap[value])
        return
      }
    }
    
    // For subcategories and other filters, update state
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
    setPriceRange([0, 100])
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
    <div className="min-h-screen bg-gray-50">      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 py-4 text-sm text-gray-600">
          <Link to="/" className="hover:text-gray-900">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900 font-medium capitalize">{gender || category}</span>
        </nav>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className={`lg:w-72 ${showFilters ? 'block' : 'hidden lg:block'}`}> 
            <div className="bg-white border border-gray-200 rounded-2xl p-5 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">Filters</h2>
                <button onClick={() => setShowFilters(false)} className="lg:hidden">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {/* Filter Sections */}
              <div className="space-y-5">
                {/* Main Categories */}
                <div className="border-b border-gray-200 pb-5">
                  <button
                    onClick={() => toggleSection('category')}
                    className="flex items-center justify-between w-full text-left mb-4"
                  >
                    <h3 className="font-semibold text-gray-900">Main Category</h3>
                    <ChevronRight className={`h-4 w-4 transition-transform ${expandedSections.category ? 'rotate-90' : ''}`} />
                  </button>
                  {expandedSections.category && (
                    <div className="space-y-3">
                      {FILTER_OPTIONS.categories.map((mainCategory) => {
                        const isActive = 
                          (mainCategory.name === 'Men' && (gender === 'men' || category === 'men')) ||
                          (mainCategory.name === 'Women' && (gender === 'women' || category === 'women')) ||
                          (mainCategory.name === 'Accessories' && category === 'accessories') ||
                          (mainCategory.name === 'Footwear' && category === 'footwear')
                        
                        return (
                          <label key={mainCategory.id} className="flex items-center cursor-pointer group">
                            <input
                              type="radio"
                              name="category"
                              checked={isActive}
                              onChange={() => toggleFilter('categories', mainCategory.name)}
                              className="w-4 h-4 border-gray-300 text-black focus:ring-1 focus:ring-black"
                            />
                            <span className={`ml-3 text-sm transition-colors ${isActive ? 'text-black font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>
                              {mainCategory.name}
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  )}
                </div>
                
                {/* Subcategories - Filter within current category */}
                <div className="border-b border-gray-200 pb-5">
                  <button
                    onClick={() => toggleSection('subcategory')}
                    className="flex items-center justify-between w-full text-left mb-4"
                  >
                    <h3 className="font-semibold text-gray-900">Type</h3>
                    <ChevronRight className={`h-4 w-4 transition-transform ${expandedSections.subcategory ? 'rotate-90' : ''}`} />
                  </button>
                  {expandedSections.subcategory && (
                    <div className="space-y-3">
                      {FILTER_OPTIONS.subcategories.map((subcategory) => (
                        <label key={subcategory.id} className="flex items-center cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={selectedFilters.subcategories.includes(subcategory.name)}
                            onChange={() => toggleFilter('subcategories', subcategory.name)}
                            className="w-4 h-4 rounded border-gray-300 text-black focus:ring-1 focus:ring-black"
                          />
                          <span className="ml-3 text-sm text-gray-600 group-hover:text-gray-900">
                            {subcategory.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Price Range */}
                <div className="border-b border-gray-200 pb-5">
                  <button
                    onClick={() => toggleSection('price')}
                    className="flex items-center justify-between w-full text-left mb-4"
                  >
                    <h3 className="font-semibold text-gray-900">Price</h3>
                    <ChevronRight className={`h-4 w-4 transition-transform ${expandedSections.price ? 'rotate-90' : ''}`} />
                  </button>
                  {expandedSections.price && (
                    <div>
                      <input
                        type="range"
                        min="0"
                        max="8000"
                        value={priceRange[1]}
                        onChange={(e) => handlePriceChange([priceRange[0], parseInt(e.target.value)])}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                      />
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-sm font-medium text-gray-900">₹{priceRange[0]}</span>
                        <span className="text-sm font-medium text-gray-900">₹{priceRange[1]}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Dress Style */}
                <div>
                  <button
                    onClick={() => toggleSection('dressStyle')}
                    className="flex items-center justify-between w-full text-left mb-4"
                  >
                    <h3 className="font-semibold text-gray-900">Dress Style</h3>
                    <ChevronRight className={`h-4 w-4 transition-transform ${expandedSections.dressStyle ? 'rotate-90' : ''}`} />
                  </button>
                  {expandedSections.dressStyle && (
                    <div className="space-y-3">
                      {FILTER_OPTIONS.dressStyles.map((style) => (
                        <label key={style.id} className="flex items-center cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={selectedFilters.dressStyles.includes(style.id)}
                            onChange={() => toggleFilter('dressStyles', style.id)}
                            className="w-4 h-4 rounded border-gray-300 text-black focus:ring-1 focus:ring-black"
                          />
                          <span className="ml-3 text-sm text-gray-600 group-hover:text-gray-900">
                            {style.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Apply Filter Button */}
              <button 
                onClick={() => setShowFilters(false)}
                className="w-full mt-6 bg-black text-white py-3 rounded-full hover:bg-gray-800 transition-colors font-medium"
              >
                Apply Filter
              </button>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1">
            {/* Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-bold capitalize">{category}</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, totalProducts)} of {totalProducts} Products
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Mobile Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="text-sm font-medium">Filters</span>
                </button>
                
                {/* Sort Dropdown */}
                <div className="relative">
                  <label className="text-sm text-gray-600 mr-2">Sort by:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white border-0 px-3 py-2 pr-8 font-medium focus:outline-none cursor-pointer"
                  >
                    <option value="most-popular">Most Popular</option>
                    <option value="newest">Newest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                  <ChevronDown className="absolute right-0 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none text-gray-400" />
                </div>
              </div>
            </div>
            
            {/* Products Grid */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
              </div>
            ) : paginatedProducts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500">No products found matching your filters.</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 px-2 md:px-4 lg:px-6">
                {paginatedProducts.map((product) => (
                  <ProductCard 
                    key={product._id || product.id} 
                    product={product} 
                    className="w-full min-h-[420px] box-border"
                  />
                ))}
              </div>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center mt-10 gap-2">
                <button
                  onClick={() => {
                    setCurrentPage(prev => Math.max(prev - 1, 1))
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => {
                      setCurrentPage(page)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                      page === currentPage
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                {totalPages > 10 && <span className="px-2 text-gray-400">...</span>}
                
                <button
                  onClick={() => {
                    setCurrentPage(prev => Math.min(prev + 1, totalPages))
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}