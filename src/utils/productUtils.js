import { ALL_PRODUCTS, NEW_ARRIVALS, TOP_SELLING, CATEGORIES } from '../constants/products'

// Product utility functions for easy management

// Get product by ID
export const getProductById = (id) => {
  return ALL_PRODUCTS.find(product => product.id === id)
}

// Get products by category
export const getProductsByCategory = (category) => {
  return ALL_PRODUCTS.filter(product => product.category === category)
}

// Get new arrivals
export const getNewArrivals = () => {
  return NEW_ARRIVALS
}

// Get top selling products
export const getTopSelling = () => {
  return TOP_SELLING
}

// Search products
export const searchProducts = (query) => {
  const lowercaseQuery = query.toLowerCase()
  return ALL_PRODUCTS.filter(product =>
    product.name.toLowerCase().includes(lowercaseQuery) ||
    product.category.toLowerCase().includes(lowercaseQuery)
  )
}

// Filter products by price range
export const filterByPriceRange = (minPrice, maxPrice) => {
  return ALL_PRODUCTS.filter(product => 
    product.price >= minPrice && product.price <= maxPrice
  )
}

// Sort products
export const sortProducts = (products, sortBy) => {
  switch (sortBy) {
    case 'price-low':
      return [...products].sort((a, b) => a.price - b.price)
    case 'price-high':
      return [...products].sort((a, b) => b.price - a.price)
    case 'rating':
      return [...products].sort((a, b) => b.rating.rating - a.rating.rating)
    case 'name':
      return [...products].sort((a, b) => a.name.localeCompare(b.name))
    default:
      return products
  }
}

// Get featured products (products with high ratings or on sale)
export const getFeaturedProducts = () => {
  return ALL_PRODUCTS.filter(product => 
    product.rating.rating >= 4.0 || product.discount
  ).slice(0, 8)
}

// Format price with currency
export const formatPrice = (price) => {
  return `$${price}`
}

// Calculate discount amount
export const calculateDiscountAmount = (originalPrice, discountPercent) => {
  return Math.round(originalPrice * (discountPercent / 100))
}

// Get all categories
export const getAllCategories = () => {
  return CATEGORIES
}

// Get products count by category
export const getProductCountByCategory = () => {
  return CATEGORIES.reduce((acc, category) => {
    acc[category] = getProductsByCategory(category).length
    return acc
  }, {})
}